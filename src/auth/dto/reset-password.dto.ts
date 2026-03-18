import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newStrongPassword123' })
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}