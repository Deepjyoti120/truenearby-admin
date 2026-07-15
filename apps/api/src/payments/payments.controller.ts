import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('razorpay/order')
  @ApiOperation({
    summary:
      'Create a Razorpay order for a paid plan. Returns order id + key id for checkout (the app never stores keys).',
  })
  createOrder(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePaymentOrderDto,
  ) {
    return this.paymentsService.createOrder(user.id, dto.planId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('razorpay/verify')
  @ApiOperation({
    summary:
      'Verify the checkout signature and activate the subscription immediately (webhook remains the safety net).',
  })
  verifyPayment(
    @CurrentUser() user: { id: string },
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(user.id, dto);
  }

  // Public endpoint called by Razorpay servers; authenticated by the
  // x-razorpay-signature HMAC over the raw body, not by JWT.
  @Post('razorpay/webhook')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Razorpay webhook for this app. Verifies signature, activates subscriptions on payment.captured/order.paid, and ignores events belonging to other apps.',
  })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }
}
