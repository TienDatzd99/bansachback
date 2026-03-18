import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ example: 25 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  payment_id: number;

  @ApiProperty({ example: 'succeeded', enum: ['pending', 'succeeded', 'failed', 'cancelled'] })
  @IsNotEmpty()
  @IsIn(['pending', 'succeeded', 'failed', 'cancelled'])
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';

  @ApiProperty({ required: false, example: 'Provider callback payload' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string;
}