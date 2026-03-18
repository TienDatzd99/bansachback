import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn({ name: 'shop_id', type: 'bigint' })
  shop_id: number;

  @Column({ name: 'user_id', type: 'bigint', unique: true })
  user_id: number;

  @Column({ name: 'shop_name', type: 'varchar', length: 200 })
  shop_name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logo_url?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
