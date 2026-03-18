import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

export class CreateBookDto {
	@ApiProperty({ example: 'Harry Potter and the Philosopher\'s Stone' })
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title: string;

	@ApiProperty({
		example:
			'https://res.cloudinary.com/domnsybxh/image/upload/v1749030415/txbscqujkfap7bpn3qs3.jpg',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	image_url?: string;

	@ApiProperty({ example: 1 })
	@IsInt()
	@Min(1)
	category_id: number;

	@ApiProperty({ example: 1 })
	@IsInt()
	@Min(1)
	author_id: number;

	@ApiProperty({ example: 19.99 })
	@IsNumber()
	@Min(0)
	price: number;

	@ApiProperty({
		example: 'The first book in the Harry Potter series.',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: 'Bloomsbury', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(150)
	publisher?: string;

	@ApiProperty({ example: 1997, required: false })
	@IsOptional()
	@IsInt()
	publication_year?: number;

	@ApiProperty({ example: '13 x 20 cm', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	dimensions?: string;

	@ApiProperty({
		example: 'https://example.com/demo-book.pdf',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	demo?: string;

	@ApiProperty({ example: 0, required: false })
	@IsOptional()
	@IsInt()
	@Min(0)
	luot_ban?: number;

	@ApiProperty({ example: 100, required: false, description: 'Số lượng tồn kho' })
	@IsOptional()
	@IsInt()
	@Min(0)
	stock_quantity?: number;
}
