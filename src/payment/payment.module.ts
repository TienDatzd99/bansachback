import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Payment, Order]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, JwtAuthGuard],
})
export class PaymentModule {}