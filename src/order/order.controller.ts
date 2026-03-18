import {
  Body,
  Controller,
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
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { OrderService } from './order.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Checkout current user cart to create order' })
  @ApiBody({ type: CheckoutDto })
  checkout(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.orderService.checkout(currentUser.sub, checkoutDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user orders' })
  getMyOrders(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.orderService.getMyOrders(currentUser.sub);
  }

  @Get('me/:id')
  @ApiOperation({ summary: 'Get current user order by id' })
  getMyOrderById(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.getMyOrderById(currentUser.sub, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update order status (admin flow)' })
  @ApiBody({ type: UpdateOrderStatusDto })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateOrderStatusDto.status);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({
    summary: 'Confirm unpaid order before shipping (admin flow)',
  })
  confirmOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.confirmOrder(id);
  }
}