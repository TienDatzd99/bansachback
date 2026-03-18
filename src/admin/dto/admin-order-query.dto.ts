import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../order/order-status.enum';

export class AdminOrderQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}