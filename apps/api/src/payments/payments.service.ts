import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';
import { PaymentOrderStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

const SETTINGS_SINGLETON_ID = 'singleton';

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity?: {
        id?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpayClient: Razorpay | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // Tag written into every order's notes so one Razorpay account can serve
  // multiple apps: each app's webhook only handles orders carrying its own id.
  private get appId(): string {
    return process.env.RAZORPAY_APP_ID ?? 'dating-app';
  }

  private getClient(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured on the server',
      );
    }
    if (!this.razorpayClient) {
      this.razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return this.razorpayClient;
  }

  async createOrder(userId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Subscription plan not found');
    }

    const price = Number(plan.price);
    if (!(price > 0)) {
      throw new BadRequestException(
        'This plan is free — activate it directly, no payment needed',
      );
    }

    const settings = await this.prisma.appSettings.findUnique({
      where: { id: SETTINGS_SINGLETON_ID },
    });
    const currency = settings?.currency ?? 'INR';
    const amountSubunits = Math.round(price * 100);

    const razorpayOrder = await this.getClient().orders.create({
      amount: amountSubunits,
      currency,
      receipt: randomUUID(),
      notes: {
        app: this.appId,
        userId,
        planId: plan.id,
        planName: plan.name,
      },
    });

    const order = await this.prisma.paymentOrder.create({
      data: {
        userId,
        subscriptionPlanId: plan.id,
        razorpayOrderId: razorpayOrder.id,
        amount: plan.price,
        currency,
        appId: this.appId,
      },
    });

    // keyId is the publishable half of the credentials; returning it here is
    // what lets the mobile app open checkout without shipping any key.
    return {
      paymentOrderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountSubunits,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planId: plan.id,
      planName: plan.name,
      description: plan.description,
    };
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { razorpayOrderId: dto.razorpayOrderId },
    });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Payment order not found');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured on the server',
      );
    }

    const expected = createHmac('sha256', keySecret)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');
    if (!this.safeEqual(expected, dto.razorpaySignature)) {
      throw new BadRequestException('Invalid payment signature');
    }
    return this.markPaidAndActivate({
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
      isWebhook: false,
    });
  }

  async handleWebhook(rawBody: Buffer | undefined, signature?: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new ServiceUnavailableException(
        'Razorpay webhook secret is not configured',
      );
    }
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!this.safeEqual(expected, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString('utf8')) as RazorpayWebhookEvent;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;
    const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id;

    if (!razorpayOrderId) {
      return { received: true, handled: false };
    }

    // One Razorpay account fans every event out to all configured webhooks.
    // Ack (200) but skip events tagged for another app or whose order this
    // app's database doesn't know about.
    const notesApp = paymentEntity?.notes?.app ?? orderEntity?.notes?.app;
    if (notesApp && notesApp !== this.appId) {
      return { received: true, handled: false };
    }

    const order = await this.prisma.paymentOrder.findUnique({
      where: { razorpayOrderId },
    });
    if (!order) {
      return { received: true, handled: false };
    }

    switch (event.event) {
      case 'payment.captured':
      case 'order.paid': {
        await this.markPaidAndActivate({
          razorpayOrderId,
          razorpayPaymentId: paymentEntity?.id,
          isWebhook: true,
        });
        this.logger.log(
          `Webhook ${event.event}: order ${razorpayOrderId} paid, subscription activated for user ${order.userId}`,
        );
        return { received: true, handled: true };
      }
      case 'payment.failed': {
        await this.prisma.paymentOrder.updateMany({
          where: {
            razorpayOrderId,
            status: PaymentOrderStatus.CREATED,
          },
          data: {
            status: PaymentOrderStatus.FAILED,
            razorpayPaymentId: paymentEntity?.id ?? null,
          },
        });
        return { received: true, handled: true };
      }
      default:
        return { received: true, handled: false };
    }
  }

  // Shared by verify + webhook; whichever lands first activates, the other
  // becomes a no-op thanks to the atomic status claim.
  private async markPaidAndActivate({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    isWebhook,
  }: {
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    isWebhook: boolean;
  }) {
    const claimed = await this.prisma.paymentOrder.updateMany({
      where: {
        razorpayOrderId,
        status: { not: PaymentOrderStatus.PAID },
      },
      data: {
        isWebhook: isWebhook,
        status: PaymentOrderStatus.PAID,
        paidAt: new Date(),
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        ...(razorpaySignature ? { razorpaySignature } : {}),
      },
    });

    const order = await this.prisma.paymentOrder.findUnique({
      where: { razorpayOrderId },
    });
    if (!order) {
      throw new NotFoundException('Payment order not found');
    }

    if (claimed.count === 0) {
      const activeSubscription =
        await this.subscriptionsService.getCurrentSubscriptionForUser(
          order.userId,
        );
      return { activeSubscription };
    }

    const result = await this.subscriptionsService.activateSubscription(
      order.userId,
      order.subscriptionPlanId,
      { allowPaid: true },
    );

    await this.prisma.paymentOrder.update({
      where: { id: order.id },
      data: { userSubscriptionId: result.activeSubscription.id },
    });

    return result;
  }

  private safeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b ?? '');
    return (
      bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
    );
  }
}
