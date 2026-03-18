import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { Shop } from './entities/shop.entity';
import { Book } from '../book/entities/book.entity';
import { Author } from '../author/entities/author.entity';
import { Category } from '../category/entities/category.entity';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Shop, Book, Author, Category, User]),
  ],
  controllers: [ShopController],
  providers: [ShopService, JwtAuthGuard, RolesGuard],
  exports: [ShopService],
})
export class ShopModule {}
