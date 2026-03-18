import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../../book/entities/book.entity';

@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn({ name: 'author_id', type: 'bigint' })
  id: number;

  @Column({ name: 'author_name', type: 'varchar', length: 100, unique: true })
  author_name: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  date_of_birth?: Date;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
