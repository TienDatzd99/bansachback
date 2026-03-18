import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}