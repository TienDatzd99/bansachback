import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ example: '0912345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: '123 Le Loi, Ward 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address_line: string;

  @ApiProperty({ example: 'Ho Chi Minh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'District 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'Ben Nghe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ward: string;

  @ApiProperty({ required: false, example: 'home' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  address_type?: string;

  @ApiProperty({ required: false, example: 'District 1' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ required: false, example: '700000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postal_code?: string;

  @ApiProperty({ required: false, example: 'VN' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}