import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOrUpdateBookReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  rating: number;

  @ApiProperty({
    example: 'Sach hay, dong goi can than, giao nhanh.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  review_text?: string;
}
