import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsNumber,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from 'class-validator';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {
	@ApiProperty({ required: false, example: 'Cay cam ngot cua toi' })
	@IsOptional()
	@IsString()
	@MaxLength(255)
	name?: string;

	@ApiProperty({ required: false, example: 5 })
	@IsOptional()
	@IsNumber()
	@Min(1)
	categoryId?: number;

	@ApiProperty({ required: false, example: 99 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	stock?: number;

	@ApiProperty({ required: false, example: 15.5 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	mrp?: number;

	@ApiProperty({ required: false, example: 15.5 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	originalPrice?: number;

	@ApiProperty({ required: false, example: 15.5 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	original_price?: number;

	@ApiProperty({ required: false, example: 12.4 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	discountedPrice?: number;

	@ApiProperty({ required: false, example: 12.4 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	discounted_price?: number;

	@ApiProperty({
		required: false,
		example: 15,
		description: 'Percent discount directly applied when updating book price',
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	discount_percent?: number;

	@ApiProperty({ required: false, example: 20 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	discountPercent?: number;

	@ApiProperty({
		required: false,
		example: 15,
		description: 'Alias for discount_percent from frontend',
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	discount?: number;
}
