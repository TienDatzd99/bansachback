import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../../book/entities/book.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'bigint' })
  id: number;

  @Column({ name: 'category_name', type: 'varchar', length: 100, unique: true })
  category_name: string;

  @OneToMany(() => Book, (book) => book.category)
  books: Book[];
}
