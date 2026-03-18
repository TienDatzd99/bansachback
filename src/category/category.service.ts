import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const normalizedName = createCategoryDto.category_name.trim();
    const existing = await this.categoryRepository.findOne({
      where: { category_name: normalizedName },
    });

    if (existing) {
      throw new ConflictException('Category name already exists');
    }

    const category = this.categoryRepository.create({
      category_name: normalizedName,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.category_name) {
      const normalizedName = updateCategoryDto.category_name.trim();
      const existing = await this.categoryRepository.findOne({
        where: { category_name: normalizedName },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category name already exists');
      }
      category.category_name = normalizedName;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: `Category with id ${id} deleted` };
  }
}
