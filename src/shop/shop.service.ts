import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { Book } from '../book/entities/book.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

export interface PaginatedBooks {
  data: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  // ─── Seller: tạo shop ───────────────────────────────────────────────────────
  async createShop(userId: number, dto: CreateShopDto): Promise<Shop> {
    const existing = await this.shopRepository.findOne({ where: { user_id: userId } });
    if (existing) {
      throw new ConflictException('Bạn đã có shop rồi, dùng PATCH /shops/me để cập nhật.');
    }
    const shop = this.shopRepository.create({ ...dto, user_id: userId });
    return this.shopRepository.save(shop);
  }

  // ─── Seller: xem shop của mình ──────────────────────────────────────────────
  async getMyShop(userId: number): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!shop) {
      throw new NotFoundException('Bạn chưa có shop. Tạo bằng POST /shops.');
    }
    return shop;
  }

  async updateMyShop(userId: number, dto: UpdateShopDto): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { user_id: userId } });
    if (!shop) {
      throw new NotFoundException('Bạn chưa có shop. Tạo bằng POST /shops.');
    }
    Object.assign(shop, dto);
    return this.shopRepository.save(shop);
  }

  async getShopByUserId(userId: number): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop của user ${userId} không tồn tại.`);
    }
    return shop;
  }

  async getShopBooks(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBooks> {
    const shopExists = await this.shopRepository.exists({ where: { user_id: userId } });
    if (!shopExists) {
      throw new NotFoundException(`Shop của user ${userId} không tồn tại.`);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.bookRepository.findAndCount({
      where: { seller_user_id: userId },
      relations: ['author', 'category'],
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
