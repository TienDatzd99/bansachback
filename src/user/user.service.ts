import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const email = createUserDto.email.toLowerCase().trim();
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      email,
      password: await bcrypt.hash(createUserDto.password, 10),
      full_name: createUserDto.full_name?.trim(),
      image_url: createUserDto.image_url?.trim(),
      address: createUserDto.address?.trim(),
      phone: createUserDto.phone?.trim(),
      dob: createUserDto.dob ? new Date(createUserDto.dob) : undefined,
    });

    const saved = await this.userRepository.save(user);
    return this.toSafeUser(saved);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({ order: { id: 'ASC' } });
    return users.map((user) => this.toSafeUser(user));
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.toSafeUser(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (updateUserDto.email !== undefined) {
      const email = updateUserDto.email.toLowerCase().trim();
      const existing = await this.userRepository.findOne({ where: { email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = email;
    }

    if (updateUserDto.password !== undefined) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.full_name !== undefined) {
      user.full_name = updateUserDto.full_name?.trim();
    }

    if (updateUserDto.image_url !== undefined) {
      user.image_url = updateUserDto.image_url?.trim();
    }

    if (updateUserDto.address !== undefined) {
      user.address = updateUserDto.address?.trim();
    }

    if (updateUserDto.phone !== undefined) {
      user.phone = updateUserDto.phone?.trim();
    }

    if (updateUserDto.dob !== undefined) {
      user.dob = updateUserDto.dob ? new Date(updateUserDto.dob) : undefined;
    }

    const updated = await this.userRepository.save(user);
    return this.toSafeUser(updated);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.remove(user);
    return { message: `User with id ${id} deleted` };
  }

  private toSafeUser(user: User): Omit<User, 'password'> {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }
}
