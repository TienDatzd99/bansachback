import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSellerRequestDto {
  @ApiProperty({
    example: 'https://cdn.example.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo_url?: string;

  @ApiProperty({ example: 'shopabc' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  username: string;

  @ApiProperty({ example: 'Shop ABC' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  shop_name: string;

  @ApiProperty({ required: false, example: 'Shop ban do gia dung' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'shopabc@example.com' })
  @IsEmail()
  @IsNotEmpty()
  contact_email: string;

  @ApiProperty({ example: '0901234567' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  contact_phone: string;

  @ApiProperty({ example: '123 Nguyen Trai, Q1, HCM' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  address: string;
}