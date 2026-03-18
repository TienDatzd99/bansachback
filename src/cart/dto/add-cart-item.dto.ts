import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  book_id: number;

  @ApiProperty({ example: 2, default: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}