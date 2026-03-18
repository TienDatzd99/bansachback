import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book } from './entities/book.entity';
import { Author } from '../author/entities/author.entity';
import { Category } from '../category/entities/category.entity';
import { BookReview } from './entities/book-review.entity';
import { BookReviewService } from './book-review.service';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Book,
      Author,
      Category,
      BookReview,
      Order,
      OrderItem,
      User,
    ]),
  ],
  controllers: [BookController],
  providers: [BookService, BookReviewService, JwtAuthGuard, RolesGuard],
})
export class BookModule {}
