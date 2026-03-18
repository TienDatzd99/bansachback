import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Author } from '../../author/entities/author.entity';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn({ name: 'book_id', type: 'bigint' })
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  image_url?: string;

  @Column({ name: 'category_id', type: 'bigint' })
  category_id: number;

  @Column({ name: 'author_id', type: 'bigint' })
  author_id: number;

  @Column({ name: 'seller_user_id', type: 'bigint', nullable: true })
  seller_user_id?: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    name: 'mrp',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  mrp?: number;

  @Column({
    name: 'discount_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  discount_percent?: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'publisher', type: 'varchar', length: 150, nullable: true })
  publisher?: string;

  @Column({ name: 'publication_year', type: 'int', nullable: true })
  publication_year?: number;

  @Column({ name: 'dimensions', type: 'varchar', length: 50, nullable: true })
  dimensions?: string;

  @Column({ name: 'demo', type: 'varchar', length: 255, nullable: true })
  demo?: string;

  @Column({ name: 'luot_ban', type: 'int', default: 0 })
  luot_ban: number;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stock_quantity: number;

  @ManyToOne(() => Category, (category) => category.books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Author, (author) => author.books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author: Author;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'seller_user_id' })
  seller?: User;
}
