import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  order_id: number;
}