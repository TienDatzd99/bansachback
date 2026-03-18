import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DiscountType = 'percent' | 'fixed';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn({ name: 'discount_id', type: 'bigint' })
  id: number;

  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({
    name: 'discount_type',
    type: 'varchar',
    length: 20,
  })
  discount_type: DiscountType;

  @Column({
    name: 'discount_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  discount_value: number;

  @Column({
    name: 'min_order_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  min_order_amount?: number;

  @Column({
    name: 'max_discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  max_discount_amount?: number;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usage_limit?: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  used_count: number;

  @Column({ name: 'starts_at', type: 'datetime', nullable: true })
  starts_at?: Date;

  @Column({ name: 'ends_at', type: 'datetime', nullable: true })
  ends_at?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at: Date;
}
