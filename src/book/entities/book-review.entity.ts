import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';
import { User } from '../../user/entities/user.entity';

@Entity('book_reviews')
@Unique('UK_book_reviews_book_user', ['book_id', 'user_id'])
export class BookReview {
  @PrimaryGeneratedColumn({ name: 'review_id', type: 'bigint' })
  id: number;

  @Column({ name: 'book_id', type: 'bigint' })
  book_id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'rating', type: 'tinyint' })
  rating: number;

  @Column({ name: 'review_text', type: 'text', nullable: true })
  review_text?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
