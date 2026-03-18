import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { OrderStatus } from '../order/order-status.enum';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ROLE_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  @UsePipes(ValidationPipe)
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiOperation({ summary: 'Get all orders for admin' })
  getOrders(@Query() query: AdminOrderQueryDto) {
    return this.adminService.getOrders(query.status);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order detail for admin' })
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOrderById(id);
  }

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get dashboard summary for admin' })
  getDashboardSummary() {
    return this.adminService.getDashboardSummary();
  }
}