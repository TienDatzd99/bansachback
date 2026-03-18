import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn({ name: 'address_id', type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  full_name: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'address_line', type: 'varchar', length: 255 })
  address_line: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'district', type: 'varchar', length: 100 })
  district: string;

  @Column({ name: 'ward', type: 'varchar', length: 100 })
  ward: string;

  @Column({ name: 'address_type', type: 'varchar', length: 30, default: 'home' })
  address_type: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postal_code?: string;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ name: 'is_default', type: 'tinyint', width: 1, default: () => '0' })
  is_default: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}