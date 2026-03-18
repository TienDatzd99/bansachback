import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'J.K. Rowling' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  author_name: string;

  @ApiProperty({ example: '1965-07-31', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;
}
