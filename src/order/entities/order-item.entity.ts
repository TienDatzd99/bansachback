import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ name: 'order_item_id', type: 'bigint' })
  id: number;

  @Column({ name: 'order_id', type: 'bigint' })
  order_id: number;

  @Column({ name: 'book_id', type: 'bigint' })
  book_id: number;

  @Column({ name: 'quantity', type: 'int', nullable: true, default: 1 })
  quantity: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @Column({ name: 'book_title', type: 'varchar', length: 255, nullable: true })
  book_title?: string;

  @Column({ name: 'category_name', type: 'varchar', length: 100, nullable: true })
  category_name?: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}