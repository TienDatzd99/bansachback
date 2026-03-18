import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { BookReview } from './entities/book-review.entity';
import { CreateOrUpdateBookReviewDto } from './dto/create-or-update-book-review.dto';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';

@Injectable()
export class BookReviewService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookReview)
    private readonly bookReviewRepository: Repository<BookReview>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrUpdateReview(
    userId: number,
    bookId: number,
    dto: CreateOrUpdateBookReviewDto,
  ) {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }

    const purchased = await this.hasPurchasedBook(userId, bookId);
    if (!purchased) {
      throw new ForbiddenException(
        'Only users who purchased this book can review it',
      );
    }

    let review = await this.bookReviewRepository.findOne({
      where: { book_id: bookId, user_id: userId },
    });

    if (!review) {
      review = this.bookReviewRepository.create({
        user_id: userId,
        book_id: bookId,
        rating: dto.rating,
        review_text: dto.review_text?.trim(),
      });
    } else {
      review.rating = dto.rating;
      review.review_text = dto.review_text?.trim();
    }

    const saved = await this.bookReviewRepository.save(review);
    const summary = await this.getReviewSummary(bookId);

    return {
      review: saved,
      summary,
    };
  }

  async getReviewsByBook(bookId: number) {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }

    const reviews = await this.bookReviewRepository.find({
      where: { book_id: bookId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      review_text: review.review_text,
      created_at: review.created_at,
      updated_at: review.updated_at,
      user: {
        id: review.user?.id,
        full_name: review.user?.full_name,
        image_url: review.user?.image_url,
      },
    }));
  }

  async getReviewSummary(bookId: number) {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }

    const raw = await this.bookReviewRepository
      .createQueryBuilder('review')
      .select('COUNT(review.review_id)', 'review_count')
      .addSelect('AVG(review.rating)', 'average_rating')
      .where('review.book_id = :bookId', { bookId })
      .getRawOne<{ review_count: string; average_rating: string | null }>();

    const reviewCount = Number(raw?.review_count || 0);
    const avg = raw?.average_rating ? Number(raw.average_rating) : 0;

    return {
      book_id: bookId,
      review_count: reviewCount,
      average_rating: Number(avg.toFixed(2)),
    };
  }

  private async hasPurchasedBook(
    userId: number,
    bookId: number,
  ): Promise<boolean> {
    const purchasedOrder = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin(
        Order,
        'orderEntity',
        'orderEntity.order_id = orderItem.order_id',
      )
      .where('orderItem.book_id = :bookId', { bookId })
      .andWhere('orderEntity.user_id = :userId', { userId })
      .andWhere('orderEntity.status IN (:...statuses)', {
        statuses: ['paid', 'completed', 'confirmed'],
      })
      .getExists();

    if (purchasedOrder) {
      return true;
    }

    const legacyPurchasedOrder = await this.orderRepository.findOne({
      where: {
        user_id: userId,
        status: 'paid',
      },
    });

    if (!legacyPurchasedOrder) {
      return false;
    }

    const legacyOrderItem = await this.orderItemRepository.findOne({
      where: {
        order_id: legacyPurchasedOrder.id,
        book_id: bookId,
      },
    });

    return Boolean(legacyOrderItem);
  }
}
