import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;

  @ApiProperty({ required: false, example: 'PAID_20260315_ABC123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  provider_transaction_id?: string;
}