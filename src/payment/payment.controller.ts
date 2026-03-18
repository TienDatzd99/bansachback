import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Optional key to avoid duplicate payment intent creation',
  })
  @ApiOperation({ summary: 'Create payment intent for an order' })
  @ApiBody({ type: CreatePaymentIntentDto })
  createIntent(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreatePaymentIntentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentService.createIntent(currentUser.sub, dto, idempotencyKey);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment result from client-side provider flow' })
  @ApiBody({ type: ConfirmPaymentDto })
  confirmPayment(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.paymentService.confirmPayment(currentUser.sub, id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments of current user' })
  getMyPayments(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.paymentService.getMyPayments(currentUser.sub);
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment detail of current user' })
  getMyPaymentById(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.getMyPaymentById(currentUser.sub, id);
  }

  @Post('webhook')
  @UsePipes(ValidationPipe)
  @ApiHeader({
    name: 'X-Webhook-Secret',
    required: true,
    description: 'Webhook shared secret configured on the provider side',
  })
  @ApiOperation({ summary: 'Webhook endpoint for payment provider callback' })
  @ApiBody({ type: PaymentWebhookDto })
  webhook(
    @Headers('x-webhook-secret') webhookSecret: string | undefined,
    @Body() dto: PaymentWebhookDto,
  ) {
    return this.paymentService.handleWebhook(webhookSecret, dto);
  }
}