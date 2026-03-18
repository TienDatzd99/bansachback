import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../user/entities/user.entity';

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id', type: 'bigint' })
  id: number;

  @Column({ name: 'order_id', type: 'bigint' })
  order_id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ name: 'payment_date', type: 'datetime', nullable: true })
  payment_date?: Date;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  qr_code?: string;

  @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
  status?: PaymentStatus;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}