import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { SellerRequestService } from './seller-request.service';
import { CreateSellerRequestDto } from './dto/create-seller-request.dto';
import { RejectSellerRequestDto } from './dto/reject-seller-request.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Seller Requests')
@ApiBearerAuth()
@Controller('seller-requests')
export class SellerRequestController {
  constructor(private readonly sellerRequestService: SellerRequestService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Get seller request list for admin review' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'approved', 'rejected'],
  })
  getAdminList(@Query('status') status?: 'pending' | 'approved' | 'rejected') {
    if (
      status &&
      status !== 'pending' &&
      status !== 'approved' &&
      status !== 'rejected'
    ) {
      throw new BadRequestException('status must be pending, approved or rejected');
    }

    return this.sellerRequestService.getAdminList(status);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: 'Get seller request detail for admin review' })
  getAdminDetail(@Param('id', ParseIntPipe) id: number) {
    return this.sellerRequestService.getAdminDetail(id);
  }

  @Get('me/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user seller request status' })
  getMyStatus(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.sellerRequestService.getMyStatus(currentUser.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Submit request to become a seller' })
  @ApiBody({ type: CreateSellerRequestDto })
  createRequest(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() createSellerRequestDto: CreateSellerRequestDto,
  ) {
    return this.sellerRequestService.createRequest(
      currentUser.sub,
      createSellerRequestDto,
    );
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Approve a seller request (admin flow)' })
  approveRequest(@Param('id', ParseIntPipe) id: number) {
    return this.sellerRequestService.approveRequest(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Reject a seller request (admin flow)' })
  @ApiBody({ type: RejectSellerRequestDto })
  rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectSellerRequestDto: RejectSellerRequestDto,
  ) {
    return this.sellerRequestService.rejectRequest(id, rejectSellerRequestDto.reason);
  }
}