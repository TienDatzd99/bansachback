import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	@IsNotEmpty()
	@MaxLength(100)
	email: string;

	@ApiProperty({ example: '123456' })
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(255)
	password: string;

	@ApiProperty({ example: 'Nguyen Van A', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	full_name?: string;

	@ApiProperty({
		example:
			'https://res.cloudinary.com/domnsybxh/image/upload/v1749030415/txbscqujkfap7bpn3qs3.jpg',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	image_url?: string;

	@ApiProperty({ example: '123 Main St', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(255)
	address?: string;

	@ApiProperty({ example: '0900000000', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	phone?: string;

	@ApiProperty({ example: '2000-01-01', required: false })
	@IsOptional()
	@IsDateString()
	dob?: string;
}
