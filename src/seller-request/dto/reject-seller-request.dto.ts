import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectSellerRequestDto {
  @ApiProperty({ example: 'Thong tin chua day du, vui long cap nhat logo va dia chi.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  reason: string;
}