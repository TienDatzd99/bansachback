import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export type SellerRequestStatus = 'pending' | 'approved' | 'rejected';

@Entity('seller_requests')
@Index(['user_id'])
@Index(['status'])
export class SellerRequest {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'logo_url', type: 'varchar', length: 255, nullable: true })
  logo_url?: string;

  @Column({ name: 'username', type: 'varchar', length: 80, unique: true })
  username: string;

  @Column({ name: 'shop_name', type: 'varchar', length: 120, unique: true })
  shop_name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 100 })
  contact_email: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20 })
  contact_phone: string;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status: SellerRequestStatus;

  @Column({ name: 'reject_reason', type: 'varchar', length: 255, nullable: true })
  reject_reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}