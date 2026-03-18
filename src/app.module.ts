import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Book } from './book/entities/book.entity';
import { Author } from './author/entities/author.entity';
import { Category } from './category/entities/category.entity';
import { AuthorModule } from './author/author.module';
import { CategoryModule } from './category/category.module';
import { SellerRequestModule } from './seller-request/seller-request.module';
import { SellerRequest } from './seller-request/entities/seller-request.entity';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Payment } from './payment/entities/payment.entity';
import { PaymentModule } from './payment/payment.module';
import { Role } from './user/entities/role.entity';
import { BookReview } from './book/entities/book-review.entity';
import { Shop } from './shop/entities/shop.entity';
import { ShopModule } from './shop/shop.module';
import { Discount } from './discount/entities/discount.entity';
import { DiscountModule } from './discount/discount.module';
import { AdminModule } from './admin/admin.module';
import { Address } from './address/entities/address.entity';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'book_store'),
        entities: [
          User,
          Role,
          Book,
          BookReview,
          Author,
          Category,
          SellerRequest,
          Cart,
          CartItem,
          Order,
          OrderItem,
          Payment,
          Address,
          Shop,
          Discount,
        ],
        synchronize: false,
      }),
    }),
    AuthModule,
    UserModule,
    BookModule,
    AuthorModule,
    CategoryModule,
    SellerRequestModule,
    CartModule,
    OrderModule,
    PaymentModule,
    ShopModule,
    DiscountModule,
    AdminModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
