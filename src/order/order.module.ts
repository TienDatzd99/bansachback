import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Address } from '../address/entities/address.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      CartItem,
      User,
      Payment,
      Address,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtAuthGuard, RolesGuard],
})
export class OrderModule {}