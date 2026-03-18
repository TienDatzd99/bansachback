import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Discount } from './entities/discount.entity';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Discount, User]),
  ],
  controllers: [DiscountController],
  providers: [DiscountService, JwtAuthGuard, RolesGuard],
  exports: [DiscountService],
})
export class DiscountModule {}
