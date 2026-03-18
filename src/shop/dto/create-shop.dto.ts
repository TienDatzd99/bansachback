import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateShopDto {
  @ApiProperty({ example: 'Sách Hay Shop' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  shop_name: string;

  @ApiPropertyOptional({ example: 'Shop chuyên bán sách kiến thức' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logo_url?: string;
}
