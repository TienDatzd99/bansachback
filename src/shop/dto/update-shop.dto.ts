import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateShopDto {
  @ApiPropertyOptional({ example: 'Sách Hay Shop v2' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  shop_name?: string;

  @ApiPropertyOptional({ example: 'Shop chuyên bán sách kiến thức và kỹ năng' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo-new.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logo_url?: string;
}
