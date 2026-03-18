import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from '../book/entities/book.entity';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';
import { OrderStatus } from '../order/order-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getDashboardSummary() {
    const [totalProducts, totalOrders, revenueRow] = await Promise.all([
      this.bookRepository.count(),
      this.orderRepository.count(),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
        .where('payment.status = :status', { status: 'succeeded' })
        .getRawOne<{ totalRevenue: string | number | null }>(),
    ]);

    return {
      totalProducts,
      totalOrders,
      totalRevenue: Number(revenueRow?.totalRevenue ?? 0),
    };
  }

  async getOrders(status?: OrderStatus) {
    const orders = await this.orderRepository.find({
      where: status ? { status } : undefined,
      relations: ['user', 'items', 'items.book', 'address'],
      order: { id: 'DESC' },
    });

    return this.enrichOrders(orders);
  }

  async getOrderById(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.book', 'address'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const [enrichedOrder] = await this.enrichOrders([order]);
    return enrichedOrder;
  }

  private async enrichOrders(orders: Order[]) {
    if (!orders.length) {
      return [];
    }

    const orderIds = orders.map((order) => order.id);
    const payments = orderIds.length
      ? await this.paymentRepository.find({
          where: { order_id: In(orderIds) },
          order: { id: 'DESC' },
        })
      : [];

    const latestPaymentByOrderId = new Map<number, Payment>();
    for (const payment of payments) {
      if (!latestPaymentByOrderId.has(payment.order_id)) {
        latestPaymentByOrderId.set(payment.order_id, payment);
      }
    }

    return orders.map((order) => {
      const { user, ...orderData } = order;
      const payment = latestPaymentByOrderId.get(order.id) ?? null;
      const isPaid = payment?.status === 'succeeded' || order.status === 'paid';
      const normalizedStatus = (order.status || '').trim().toLowerCase();
      const safeUser = user
        ? {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            image_url: user.image_url,
            address: user.address,
            phone: user.phone,
            dob: user.dob,
          }
        : null;

      return {
        ...orderData,
        user: safeUser,
        payment,
        isPaid,
        requiresAdminConfirmation: !isPaid && normalizedStatus === 'pending',
        canStartShipping: isPaid || normalizedStatus === 'confirmed',
      };
    });
  }
}