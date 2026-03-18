import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { Author } from './entities/author.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Author, User]),
  ],
  controllers: [AuthorController],
  providers: [AuthorService, JwtAuthGuard, RolesGuard],
  exports: [AuthorService],
})
export class AuthorModule {}
