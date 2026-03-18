import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@ApiTags('Shops')
@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // ─── Seller: tạo shop của mình ──────────────────────────────────────────────
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({
    summary: 'Tạo shop cho tài khoản đang đăng nhập (admin)',
  })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateShopDto,
  ) {
    return this.shopService.createShop(user.sub, dto);
  }

  // ─── Seller: xem shop của mình ──────────────────────────────────────────────
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Lấy thông tin shop của tài khoản đăng nhập (admin)' })
  getMyShop(@CurrentUser() user: CurrentUserPayload) {
    return this.shopService.getMyShop(user.sub);
  }

  // ─── Seller: cập nhật shop của mình ─────────────────────────────────────────
  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Cập nhật thông tin shop của tài khoản đăng nhập (admin)' })
  updateMyShop(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopService.updateMyShop(user.sub, dto);
  }

  // ─── Public: xem thông tin shop theo seller user_id ─────────────────────────
  @Get(':userId')
  @ApiOperation({ summary: 'Lấy thông tin shop công khai theo seller user_id' })
  getShop(@Param('userId', ParseIntPipe) userId: number) {
    return this.shopService.getShopByUserId(userId);
  }

  // ─── Public: xem sách của shop (phân trang) ──────────────────────────────────
  @Get(':userId/books')
  @ApiOperation({
    summary: 'Lấy danh sách sách của shop theo seller user_id (có phân trang)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  getShopBooks(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    return this.shopService.getShopBooks(userId, pageNum, limitNum);
  }
}
