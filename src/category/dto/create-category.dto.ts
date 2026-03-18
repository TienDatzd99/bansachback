import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fantasy' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category_name: string;
}
