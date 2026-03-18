import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';

enum DiscountTypeDto {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export class CreateDiscountDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ enum: DiscountTypeDto, example: DiscountTypeDto.PERCENT })
  @IsEnum(DiscountTypeDto)
  discount_type: DiscountTypeDto;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  discount_value: number;

  @ApiProperty({ required: false, example: 200000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_amount?: number;

  @ApiProperty({ required: false, example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount_amount?: number;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usage_limit?: number;

  @ApiProperty({ required: false, example: '2026-03-16T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  starts_at?: string;

  @ApiProperty({ required: false, example: '2026-04-30T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  ends_at?: string;

  @ApiProperty({ required: false, example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
