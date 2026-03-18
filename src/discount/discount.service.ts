import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount } from './entities/discount.entity';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async create(dto: CreateDiscountDto) {
    this.validateBusinessRules({
      discount_type: dto.discount_type,
      discount_value: dto.discount_value,
      min_order_amount: dto.min_order_amount,
      max_discount_amount: dto.max_discount_amount,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : undefined,
      ends_at: dto.ends_at ? new Date(dto.ends_at) : undefined,
    });

    const normalizedCode = dto.code.trim().toUpperCase();
    const existingDiscount = await this.discountRepository.findOne({
      where: { code: normalizedCode },
    });

    if (existingDiscount) {
      throw new ConflictException('Discount code already exists');
    }

    const discount = this.discountRepository.create({
      code: normalizedCode,
      discount_type: dto.discount_type,
      discount_value: dto.discount_value,
      min_order_amount: dto.min_order_amount,
      max_discount_amount: dto.max_discount_amount,
      usage_limit: dto.usage_limit,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : undefined,
      ends_at: dto.ends_at ? new Date(dto.ends_at) : undefined,
      is_active: dto.is_active ?? true,
    });

    return this.discountRepository.save(discount);
  }

  async findAll() {
    return this.discountRepository.find({ order: { id: 'DESC' } });
  }

  async findByCode(code: string) {
    const discount = await this.discountRepository.findOne({
      where: { code: code.trim().toUpperCase() },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  async findOne(id: number) {
    const discount = await this.discountRepository.findOne({ where: { id } });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto) {
    const discount = await this.findOne(id);

    const merged = {
      ...discount,
      ...dto,
      code: dto.code ? dto.code.trim().toUpperCase() : discount.code,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : discount.starts_at,
      ends_at: dto.ends_at ? new Date(dto.ends_at) : discount.ends_at,
    };

    this.validateBusinessRules(merged);

    if (dto.code) {
      const existingDiscount = await this.discountRepository.findOne({
        where: { code: merged.code },
      });
      if (existingDiscount && existingDiscount.id !== id) {
        throw new ConflictException('Discount code already exists');
      }
    }

    discount.code = merged.code;
    discount.discount_type = merged.discount_type;
    discount.discount_value = merged.discount_value;
    discount.min_order_amount = merged.min_order_amount;
    discount.max_discount_amount = merged.max_discount_amount;
    discount.usage_limit = merged.usage_limit;
    discount.starts_at = merged.starts_at;
    discount.ends_at = merged.ends_at;
    discount.is_active = merged.is_active;

    return this.discountRepository.save(discount);
  }

  async remove(id: number) {
    const discount = await this.findOne(id);
    await this.discountRepository.remove(discount);
    return { message: 'Discount deleted successfully' };
  }

  private validateBusinessRules(
    payload: Pick<
      Discount,
      | 'discount_type'
      | 'discount_value'
      | 'min_order_amount'
      | 'max_discount_amount'
      | 'starts_at'
      | 'ends_at'
    >,
  ) {
    if (payload.discount_type === 'percent' && payload.discount_value > 100) {
      throw new BadRequestException(
        'Percent discount cannot be greater than 100',
      );
    }

    if (
      payload.starts_at &&
      payload.ends_at &&
      new Date(payload.starts_at) > new Date(payload.ends_at)
    ) {
      throw new BadRequestException(
        'starts_at must be less than or equal to ends_at',
      );
    }

    if (
      payload.max_discount_amount !== undefined &&
      payload.max_discount_amount !== null &&
      payload.max_discount_amount < 0
    ) {
      throw new BadRequestException('max_discount_amount cannot be negative');
    }

    if (
      payload.min_order_amount !== undefined &&
      payload.min_order_amount !== null &&
      payload.min_order_amount < 0
    ) {
      throw new BadRequestException('min_order_amount cannot be negative');
    }
  }
}
