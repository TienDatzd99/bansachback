import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Address } from '../../address/entities/address.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'order_discount_id', type: 'bigint', nullable: true })
  order_discount_id?: number;

  @Column({ name: 'order_code', type: 'varchar', length: 40, unique: true, nullable: true })
  order_code?: string;

  @Column({ name: 'discount_code', type: 'varchar', length: 50, nullable: true })
  discount_code?: string;

  @Column({ name: 'address_id', type: 'bigint', nullable: true })
  address_id?: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 30, nullable: true })
  payment_method?: string;

  @Column({ name: 'subtotal_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal_amount?: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_amount?: number;

  @Column({ name: 'shipping_full_name', type: 'varchar', length: 100, nullable: true })
  shipping_full_name?: string;

  @Column({ name: 'shipping_phone', type: 'varchar', length: 20, nullable: true })
  shipping_phone?: string;

  @Column({ name: 'shipping_city', type: 'varchar', length: 100, nullable: true })
  shipping_city?: string;

  @Column({ name: 'shipping_district', type: 'varchar', length: 100, nullable: true })
  shipping_district?: string;

  @Column({ name: 'shipping_ward', type: 'varchar', length: 100, nullable: true })
  shipping_ward?: string;

  @Column({ name: 'shipping_address_line', type: 'varchar', length: 255, nullable: true })
  shipping_address_line?: string;

  @Column({ name: 'shipping_address_type', type: 'varchar', length: 30, nullable: true })
  shipping_address_type?: string;

  @Column({ name: 'order_date', type: 'datetime', nullable: true })
  order_date?: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_amount?: number;

  @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
  status?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id' })
  address?: Address;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}