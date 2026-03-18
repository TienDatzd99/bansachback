import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Address } from './entities/address.entity';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [ConfigModule, JwtModule.register({}), TypeOrmModule.forFeature([Address])],
  controllers: [AddressController],
  providers: [AddressService, JwtAuthGuard],
  exports: [AddressService],
})
export class AddressModule {}