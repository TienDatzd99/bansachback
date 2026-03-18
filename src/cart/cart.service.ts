import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Book } from '../book/entities/book.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async getMyCart(userId: number) {
    const cart = await this.getOrCreateActiveCart(userId);
    const items = await this.cartItemRepository.find({
      where: { cart_id: cart.id },
      relations: ['book'],
      order: { id: 'ASC' },
    });

    const total = items.reduce((sum, item) => {
      const lineTotal = Number(item.price) * item.quantity;
      return sum + lineTotal;
    }, 0);

    return {
      cart,
      items,
      summary: {
        total_items: items.length,
        total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        total_amount: Number(total.toFixed(2)),
      },
    };
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    const cart = await this.getOrCreateActiveCart(userId);
    const book = await this.bookRepository.findOne({ where: { id: dto.book_id } });

    if (!book) {
      throw new NotFoundException(`Book with id ${dto.book_id} not found`);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, book_id: dto.book_id },
    });

    if (!cartItem) {
      cartItem = this.cartItemRepository.create({
        cart_id: cart.id,
        book_id: dto.book_id,
        quantity: dto.quantity,
        price: Number(book.price),
      });
    } else {
      cartItem.quantity += dto.quantity;
      cartItem.price = Number(book.price);
    }

    await this.cartItemRepository.save(cartItem);
    return this.getMyCart(userId);
  }

  async updateItem(userId: number, cartItemId: number, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateActiveCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cart_id: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with id ${cartItemId} not found`);
    }

    cartItem.quantity = dto.quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getMyCart(userId);
  }

  async removeItem(userId: number, cartItemId: number) {
    const cart = await this.getOrCreateActiveCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cart_id: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with id ${cartItemId} not found`);
    }

    await this.cartItemRepository.remove(cartItem);
    return this.getMyCart(userId);
  }

  async clearMyCart(userId: number) {
    const cart = await this.getOrCreateActiveCart(userId);
    await this.cartItemRepository.delete({ cart_id: cart.id });
    return this.getMyCart(userId);
  }

  async getOrCreateActiveCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId, status: 'active' },
      order: { id: 'DESC' },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user_id: userId,
        status: 'active',
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }
}