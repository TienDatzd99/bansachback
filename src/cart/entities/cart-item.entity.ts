import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn({ name: 'cart_item_id', type: 'bigint' })
  id: number;

  @Column({ name: 'cart_id', type: 'bigint' })
  cart_id: number;

  @Column({ name: 'book_id', type: 'bigint' })
  book_id: number;

  @Column({ name: 'quantity', type: 'int', nullable: true, default: 1 })
  quantity: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}