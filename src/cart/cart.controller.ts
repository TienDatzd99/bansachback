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
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Carts')
@ApiBearerAuth()
@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user active cart' })
  getMyCart(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.cartService.getMyCart(currentUser.sub);
  }

  @Post('items')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Add item to current user cart' })
  @ApiBody({ type: AddCartItemDto })
  addItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItem(currentUser.sub, addCartItemDto);
  }

  @Patch('items/:id')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update item quantity in current user cart' })
  @ApiBody({ type: UpdateCartItemDto })
  updateItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(currentUser.sub, id, updateCartItemDto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from current user cart' })
  removeItem(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeItem(currentUser.sub, id);
  }

  @Delete('me/clear')
  @ApiOperation({ summary: 'Clear all items from current user cart' })
  clearMyCart(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.cartService.clearMyCart(currentUser.sub);
  }
}