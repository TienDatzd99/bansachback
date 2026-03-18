import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

enum DiscountTypeDto {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export class UpdateDiscountDto {
  @ApiProperty({ required: false, example: 'WELCOME10' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ required: false, enum: DiscountTypeDto, example: DiscountTypeDto.PERCENT })
  @IsOptional()
  @IsEnum(DiscountTypeDto)
  discount_type?: DiscountTypeDto;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_value?: number;

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

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
