import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { Book } from '../book/entities/book.entity';
import { Discount } from '../discount/entities/discount.entity';
import { Payment } from '../payment/entities/payment.entity';
import { OrderStatus, SHIPPING_ORDER_STATUSES } from './order-status.enum';
import { Address } from '../address/entities/address.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async checkout(userId: number, dto: CheckoutDto) {
    return this.dataSource.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { user_id: userId, status: 'active' },
        order: { id: 'DESC' },
      });

      if (!cart) {
        throw new BadRequestException('Active cart not found');
      }

      const cartItems = await manager.find(CartItem, {
        where: { cart_id: cart.id },
      });

      if (!cartItems.length) {
        throw new BadRequestException('Cart is empty');
      }

      // Aggregate by book to avoid double-updating stock when duplicate cart rows exist.
      const bookQuantityMap = new Map<number, number>();
      for (const item of cartItems) {
        const currentQty = bookQuantityMap.get(item.book_id) ?? 0;
        bookQuantityMap.set(item.book_id, currentQty + item.quantity);
      }

      for (const [bookId, quantity] of bookQuantityMap.entries()) {
        const updateResult = await manager
          .createQueryBuilder()
          .update(Book)
          .set({
            stock_quantity: () => `stock_quantity - ${quantity}`,
            luot_ban: () => `luot_ban + ${quantity}`,
          })
          .where('book_id = :bookId', { bookId })
          .andWhere('stock_quantity >= :quantity', { quantity })
          .execute();

        if (!updateResult.affected) {
          const book = await manager.findOne(Book, { where: { id: bookId } });
          if (!book) {
            throw new NotFoundException(`Book with id ${bookId} not found`);
          }
          throw new BadRequestException(
            `Book ${bookId} is out of stock or does not have enough quantity`,
          );
        }
      }

      const books = await manager.find(Book, {
        where: { id: In([...bookQuantityMap.keys()]) },
        relations: ['category'],
      });
      const bookById = new Map(books.map((book) => [book.id, book]));

      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);

      let discountAmount = 0;
      let appliedDiscountId: number | undefined;
      const resolvedDiscountCode = dto.discount_code ?? dto.coupon_code;
      let resolvedAddressId: number | undefined;
      let resolvedAddress: Address | null = null;

      if (dto.address_id !== undefined) {
        const address = await manager.findOne(Address, {
          where: { id: dto.address_id, user_id: userId },
        });

        if (!address) {
          throw new BadRequestException('Address not found for current user');
        }

        resolvedAddressId = address.id;
        resolvedAddress = address;
      } else {
        const defaultAddress = await manager.findOne(Address, {
          where: { user_id: userId, is_default: true },
          order: { id: 'DESC' },
        });

        const fallbackAddress =
          defaultAddress ||
          (await manager.findOne(Address, {
            where: { user_id: userId },
            order: { id: 'DESC' },
          }));

        if (!fallbackAddress) {
          throw new BadRequestException(
            'Please create a shipping address before placing order',
          );
        }

        resolvedAddressId = fallbackAddress.id;
        resolvedAddress = fallbackAddress;
      }

      if (resolvedDiscountCode?.trim()) {
        const now = new Date();
        const normalizedDiscountCode = resolvedDiscountCode.trim().toUpperCase();
        const discount = await manager.findOne(Discount, {
          where: { code: normalizedDiscountCode },
        });

        if (!discount) {
          throw new BadRequestException('Invalid discount code');
        }

        if (!discount.is_active) {
          throw new BadRequestException('Discount code is inactive');
        }

        if (discount.starts_at && now < new Date(discount.starts_at)) {
          throw new BadRequestException('Discount code is not active yet');
        }

        if (discount.ends_at && now > new Date(discount.ends_at)) {
          throw new BadRequestException('Discount code has expired');
        }

        if (
          discount.min_order_amount !== undefined &&
          discount.min_order_amount !== null &&
          totalAmount < Number(discount.min_order_amount)
        ) {
          throw new BadRequestException(
            `Minimum order amount is ${discount.min_order_amount} for this discount`,
          );
        }

        if (
          discount.usage_limit !== undefined &&
          discount.usage_limit !== null &&
          discount.used_count >= discount.usage_limit
        ) {
          throw new BadRequestException('Discount code usage limit reached');
        }

        if (discount.discount_type === 'percent') {
          discountAmount = (totalAmount * Number(discount.discount_value)) / 100;
        } else {
          discountAmount = Number(discount.discount_value);
        }

        if (
          discount.max_discount_amount !== undefined &&
          discount.max_discount_amount !== null
        ) {
          discountAmount = Math.min(
            discountAmount,
            Number(discount.max_discount_amount),
          );
        }

        discountAmount = Math.min(discountAmount, totalAmount);

        const updateUsageResult = await manager
          .createQueryBuilder()
          .update(Discount)
          .set({ used_count: () => 'used_count + 1' })
          .where('discount_id = :id', { id: discount.id })
          .andWhere(
            '(usage_limit IS NULL OR used_count < usage_limit)',
          )
          .execute();

        if (!updateUsageResult.affected) {
          throw new BadRequestException('Discount code usage limit reached');
        }

        appliedDiscountId = discount.id;
      }

      const finalTotalAmount = Number((totalAmount - discountAmount).toFixed(2));

      const order = manager.create(Order, {
        user_id: userId,
        order_code: this.generateOrderCode(),
        order_discount_id: appliedDiscountId,
        discount_code: resolvedDiscountCode?.trim().toUpperCase(),
        address_id: resolvedAddressId,
        payment_method: dto.payment_method?.trim().toLowerCase() || 'cod',
        order_date: new Date(),
        subtotal_amount: Number(totalAmount.toFixed(2)),
        discount_amount: Number(discountAmount.toFixed(2)),
        total_amount: finalTotalAmount,
        status: dto.status?.trim() || 'pending',
        shipping_full_name: resolvedAddress?.full_name,
        shipping_phone: resolvedAddress?.phone,
        shipping_city: resolvedAddress?.city,
        shipping_district: resolvedAddress?.district,
        shipping_ward: resolvedAddress?.ward,
        shipping_address_line: resolvedAddress?.address_line,
        shipping_address_type: resolvedAddress?.address_type,
      });

      const savedOrder = await manager.save(Order, order);

      const orderItems = cartItems.map((item) => {
        const book = bookById.get(item.book_id);
        const subtotal = Number(item.price) * item.quantity;
        return manager.create(OrderItem, {
          order_id: savedOrder.id,
          book_id: item.book_id,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(subtotal.toFixed(2)),
          book_title: book?.title,
          category_name: book?.category?.category_name,
        });
      });

      await manager.save(OrderItem, orderItems);
      await manager.delete(CartItem, { cart_id: cart.id });

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.book', 'address'],
      });
    });
  }

  async getMyOrders(userId: number) {
    return this.orderRepository.find({
      where: { user_id: userId },
      relations: ['items', 'items.book', 'address'],
      order: { id: 'DESC' },
    });
  }

  async getMyOrderById(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user_id: userId },
      relations: ['items', 'items.book', 'address'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const normalizedStatus = status;
    const isPaid = await this.hasSuccessfulPayment(orderId);

    if (normalizedStatus === OrderStatus.PAID) {
      throw new BadRequestException('Paid status is managed by payment flow');
    }

    if (normalizedStatus === OrderStatus.CONFIRMED && isPaid) {
      throw new BadRequestException(
        'Paid orders do not require admin confirmation before shipping',
      );
    }

    if (this.isShippingStatus(normalizedStatus) && !isPaid) {
      const currentStatus = this.normalizeOrderStatus(order.status);
      if (currentStatus !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(
          'Unpaid orders must be confirmed by admin before shipping starts',
        );
      }
    }

    order.status = normalizedStatus;
    return this.orderRepository.save(order);
  }

  async confirmOrder(orderId: number) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const isPaid = await this.hasSuccessfulPayment(orderId);
    if (isPaid) {
      throw new BadRequestException(
        'Paid orders do not require admin confirmation before shipping',
      );
    }

    const currentStatus = this.normalizeOrderStatus(order.status);
    if (currentStatus === OrderStatus.CONFIRMED) {
      return order;
    }

    if (this.isShippingStatus(currentStatus)) {
      throw new BadRequestException('Order is already in shipping flow');
    }

    order.status = OrderStatus.CONFIRMED;
    return this.orderRepository.save(order);
  }

  private async hasSuccessfulPayment(orderId: number): Promise<boolean> {
    const payment = await this.paymentRepository.findOne({
      where: { order_id: orderId, status: 'succeeded' },
    });

    return !!payment;
  }

  private isShippingStatus(status?: string | OrderStatus): boolean {
    if (!status) {
      return false;
    }

    return SHIPPING_ORDER_STATUSES.includes(status as OrderStatus);
  }

  private normalizeOrderStatus(status?: string | null): OrderStatus | undefined {
    if (!status) {
      return undefined;
    }

    const normalized = status.trim().toLowerCase();
    return Object.values(OrderStatus).find((value) => value === normalized);
  }

  private generateOrderCode(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
  }
}