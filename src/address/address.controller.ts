import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user addresses' })
  getMyAddresses(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.addressService.getMyAddresses(currentUser.sub);
  }

  @Post('me')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Create address for current user' })
  @ApiBody({ type: CreateAddressDto })
  createMyAddress(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.createMyAddress(currentUser.sub, dto);
  }

  @Patch('me/:id')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update an address of current user' })
  @ApiBody({ type: UpdateAddressDto })
  updateMyAddress(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateMyAddress(currentUser.sub, id, dto);
  }

  @Patch('me/:id/default')
  @ApiOperation({ summary: 'Set default address for current user' })
  setDefaultMyAddress(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.setDefaultMyAddress(currentUser.sub, id);
  }

  @Delete('me/:id')
  @ApiOperation({ summary: 'Delete an address of current user' })
  removeMyAddress(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.removeMyAddress(currentUser.sub, id);
  }
}