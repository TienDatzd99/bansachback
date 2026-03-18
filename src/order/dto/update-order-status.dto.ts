import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: OrderStatus.CONFIRMED, enum: OrderStatus })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}