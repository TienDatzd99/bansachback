import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const normalizedName = createAuthorDto.author_name.trim();

    const existing = await this.authorRepository.findOne({
      where: { author_name: normalizedName },
    });
    if (existing) {
      throw new ConflictException('Author name already exists');
    }

    const author = this.authorRepository.create({
      author_name: normalizedName,
      date_of_birth: createAuthorDto.date_of_birth
        ? new Date(createAuthorDto.date_of_birth)
        : undefined,
    });

    return this.authorRepository.save(author);
  }

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException(`Author with id ${id} not found`);
    }
    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);

    if (updateAuthorDto.author_name) {
      const normalizedName = updateAuthorDto.author_name.trim();
      const existing = await this.authorRepository.findOne({
        where: { author_name: normalizedName },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Author name already exists');
      }
      author.author_name = normalizedName;
    }

    if (updateAuthorDto.date_of_birth !== undefined) {
      author.date_of_birth = updateAuthorDto.date_of_birth
        ? new Date(updateAuthorDto.date_of_birth)
        : undefined;
    }

    return this.authorRepository.save(author);
  }

  async remove(id: number): Promise<{ message: string }> {
    const author = await this.findOne(id);
    await this.authorRepository.remove(author);
    return { message: `Author with id ${id} deleted` };
  }
}
