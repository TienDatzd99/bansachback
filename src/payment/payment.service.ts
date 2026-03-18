import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createIntent(
    userId: number,
    dto: CreatePaymentIntentDto,
    idempotencyKey?: string,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: dto.order_id, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${dto.order_id} not found`);
    }

    if (!order.total_amount || Number(order.total_amount) <= 0) {
      throw new BadRequestException('Order total amount is invalid');
    }

    if (order.status?.toLowerCase() === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: {
        order_id: dto.order_id,
        user_id: userId,
        status: In(['pending', 'succeeded']),
      },
      order: { id: 'DESC' },
    });

    if (existingPayment && idempotencyKey) {
      return {
        reused: true,
        payment: existingPayment,
      };
    }

    if (existingPayment?.status === 'pending') {
      return {
        reused: true,
        payment: existingPayment,
      };
    }

    const created = await this.paymentRepository.save(
      this.paymentRepository.create({
        order_id: dto.order_id,
        user_id: userId,
        amount: Number(order.total_amount),
        payment_date: new Date(),
        status: 'pending',
      }),
    );

    created.qr_code = this.buildQrUrl(created.id, dto.order_id, Number(order.total_amount));
    await this.paymentRepository.save(created);

    return {
      reused: false,
      payment: created,
    };
  }

  async confirmPayment(userId: number, paymentId: number, dto: ConfirmPaymentDto) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, user_id: userId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${paymentId} not found`);
    }

    if (payment.status === 'succeeded') {
      return payment;
    }

    payment.status = dto.success ? 'succeeded' : 'failed';
    payment.payment_date = new Date();
    await this.paymentRepository.save(payment);

    if (dto.success) {
      await this.markOrderAsPaid(payment.order_id);
    }

    return payment;
  }

  async getMyPayments(userId: number) {
    return this.paymentRepository.find({
      where: { user_id: userId },
      order: { id: 'DESC' },
    });
  }

  async getMyPaymentById(userId: number, paymentId: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, user_id: userId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${paymentId} not found`);
    }

    return payment;
  }

  async handleWebhook(secretHeader: string | undefined, dto: PaymentWebhookDto) {
    const expectedSecret = process.env.PAYMENTS_WEBHOOK_SECRET || 'dev_webhook_secret';
    if (!secretHeader || secretHeader !== expectedSecret) {
      throw new ForbiddenException('Invalid webhook secret');
    }

    const payment = await this.paymentRepository.findOne({
      where: { id: dto.payment_id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${dto.payment_id} not found`);
    }

    payment.status = dto.status;
    payment.payment_date = new Date();
    await this.paymentRepository.save(payment);

    if (dto.status === 'succeeded') {
      await this.markOrderAsPaid(payment.order_id);
    }

    return {
      success: true,
      payment,
      message: dto.message || 'Webhook processed successfully',
    };
  }

  private async markOrderAsPaid(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return;
    }

    order.status = 'paid';
    await this.orderRepository.save(order);
  }

  private buildQrUrl(paymentId: number, orderId: number, amount: number): string {
    const base = process.env.PAYMENT_QR_BASE_URL || 'https://pay.example.com/qr';
    return `${base}?payment_id=${paymentId}&order_id=${orderId}&amount=${amount}`;
  }
}