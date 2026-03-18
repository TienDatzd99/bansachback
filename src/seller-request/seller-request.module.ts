import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SellerRequestController } from './seller-request.controller';
import { SellerRequestService } from './seller-request.service';
import { SellerRequest } from './entities/seller-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';
import { Shop } from '../shop/entities/shop.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([SellerRequest, User, Shop]),
  ],
  controllers: [SellerRequestController],
  providers: [SellerRequestService, JwtAuthGuard, RolesGuard],
})
export class SellerRequestModule {}