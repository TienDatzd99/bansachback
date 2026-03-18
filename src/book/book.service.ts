import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { Author } from '../author/entities/author.entity';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    await this.ensureAuthorExists(createBookDto.author_id);
    await this.ensureCategoryExists(createBookDto.category_id);

    const book = this.bookRepository.create({
      ...createBookDto,
      title: createBookDto.title.trim(),
      publisher: createBookDto.publisher?.trim(),
      dimensions: createBookDto.dimensions?.trim(),
      description: createBookDto.description?.trim(),
      image_url: createBookDto.image_url?.trim(),
      demo: createBookDto.demo?.trim(),
    });

    return this.bookRepository.save(book);
  }

  async createForSeller(userId: number, createBookDto: CreateBookDto): Promise<Book> {
    await this.ensureAuthorExists(createBookDto.author_id);
    await this.ensureCategoryExists(createBookDto.category_id);

    const book = this.bookRepository.create({
      ...createBookDto,
      seller_user_id: userId,
      title: createBookDto.title.trim(),
      publisher: createBookDto.publisher?.trim(),
      dimensions: createBookDto.dimensions?.trim(),
      description: createBookDto.description?.trim(),
      image_url: createBookDto.image_url?.trim(),
      demo: createBookDto.demo?.trim(),
    });

    return this.bookRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find({
      relations: ['author', 'category'],
      order: { id: 'ASC' },
    });
  }

  async findMyBooks(userId: number): Promise<Book[]> {
    return this.bookRepository.find({
      where: { seller_user_id: userId },
      relations: ['author', 'category'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    const resolvedCategoryId =
      updateBookDto.category_id ?? updateBookDto.categoryId;
    const resolvedTitle = updateBookDto.title ?? updateBookDto.name;
    const resolvedStockQuantity =
      updateBookDto.stock_quantity ?? updateBookDto.stock;
    const resolvedPrice =
      updateBookDto.price ??
      updateBookDto.discountedPrice ??
      updateBookDto.discounted_price;
    const resolvedMrp =
      updateBookDto.mrp ??
      updateBookDto.originalPrice ??
      updateBookDto.original_price;
    const resolvedDiscountPercent =
      updateBookDto.discount_percent ??
      updateBookDto.discountPercent ??
      updateBookDto.discount;

    if (updateBookDto.author_id !== undefined) {
      await this.ensureAuthorExists(updateBookDto.author_id);
      book.author_id = updateBookDto.author_id;
    }

    if (resolvedCategoryId !== undefined) {
      await this.ensureCategoryExists(resolvedCategoryId);
      book.category_id = resolvedCategoryId;
    }

    if (resolvedTitle !== undefined) {
      book.title = resolvedTitle.trim();
    }

    if (updateBookDto.image_url !== undefined) {
      book.image_url = updateBookDto.image_url?.trim();
    }

    if (resolvedMrp !== undefined) {
      book.mrp = resolvedMrp;
    }

    if (resolvedDiscountPercent !== undefined) {
      book.discount_percent = resolvedDiscountPercent;
    }

    if (resolvedMrp !== undefined || resolvedDiscountPercent !== undefined) {
      let baseMrp =
        resolvedMrp !== undefined ? Number(resolvedMrp) : Number(book.mrp);

      if (!Number.isFinite(baseMrp) || baseMrp < 0) {
        if (resolvedPrice !== undefined) {
          baseMrp = Number(resolvedPrice);
          book.mrp = Number(resolvedPrice);
        } else {
          throw new BadRequestException(
            'mrp is required to calculate price from discount',
          );
        }
      }

      const discountPercent =
        resolvedDiscountPercent !== undefined
          ? Number(resolvedDiscountPercent)
          : Number(book.discount_percent ?? 0);

      const finalPrice = baseMrp * (1 - discountPercent / 100);
      book.price = Number(finalPrice.toFixed(2));
    } else if (resolvedPrice !== undefined) {
      book.price = resolvedPrice;
      if (book.mrp === undefined || book.mrp === null) {
        book.mrp = resolvedPrice;
      }
    }

    if (updateBookDto.description !== undefined) {
      book.description = updateBookDto.description?.trim();
    }

    if (updateBookDto.publisher !== undefined) {
      book.publisher = updateBookDto.publisher?.trim();
    }

    if (updateBookDto.publication_year !== undefined) {
      book.publication_year = updateBookDto.publication_year;
    }

    if (updateBookDto.dimensions !== undefined) {
      book.dimensions = updateBookDto.dimensions?.trim();
    }

    if (updateBookDto.demo !== undefined) {
      book.demo = updateBookDto.demo?.trim();
    }

    if (updateBookDto.luot_ban !== undefined) {
      book.luot_ban = updateBookDto.luot_ban;
    }

    if (resolvedStockQuantity !== undefined) {
      book.stock_quantity = resolvedStockQuantity;
    }

    await this.bookRepository.save(book);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
    return { message: `Book with id ${id} deleted` };
  }

  private async ensureAuthorExists(authorId: number): Promise<void> {
    const author = await this.authorRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException(`Author with id ${authorId} not found`);
    }
  }

  private async ensureCategoryExists(categoryId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }
  }
}
