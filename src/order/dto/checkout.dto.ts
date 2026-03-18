import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ required: false, example: 'pending' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiProperty({ required: false, example: 'WELCOME10' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  discount_code?: string;

  @ApiProperty({ required: false, example: 'WELCOME10' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  coupon_code?: string;

  @ApiProperty({ required: false, example: 'cod' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  payment_method?: string;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  address_id?: number;
}