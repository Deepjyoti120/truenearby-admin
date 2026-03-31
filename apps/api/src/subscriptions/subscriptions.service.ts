import { Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SubscriptionPlanSeed = {
  id: string;
  code: Plan;
  name: string;
  description: string | null;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
  canReverseLastSwipe: boolean;
  canChangeSwipeDecision: boolean;
  canSeeWhoLikedYou: boolean;
  showLikesInAdvancedHome: boolean;
};

type SubscriptionPlanRecord = SubscriptionPlanSeed & {
  createdAt: Date;
  updatedAt: Date;
};

type UserSubscriptionRecord = {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  plan: Plan;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: SubscriptionPlanRecord;
};

export type SubscriptionFeatures = {
  canReverseLastSwipe: boolean;
  canChangeSwipeDecision: boolean;
  canSeeWhoLikedYou: boolean;
  showLikesInAdvancedHome: boolean;
};

export type CurrentSubscriptionSummary = {
  id: string | null;
  planId: string;
  plan: Plan;
  name: string;
  description: string | null;
  durationDays: number;
  isActive: boolean;
  isDefault: boolean;
  startAt: Date | null;
  endAt: Date | null;
  cancelledAt: Date | null;
  features: SubscriptionFeatures;
};

const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlanSeed[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: Plan.FREE,
    name: 'Free',
    description: 'Base plan with standard swiping.',
    durationDays: 30,
    isActive: true,
    sortOrder: 0,
    canReverseLastSwipe: false,
    canChangeSwipeDecision: false,
    canSeeWhoLikedYou: false,
    showLikesInAdvancedHome: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: Plan.PLUS,
    name: 'Plus',
    description: 'Includes reverse swipe and swipe decision changes.',
    durationDays: 30,
    isActive: true,
    sortOrder: 1,
    canReverseLastSwipe: true,
    canChangeSwipeDecision: true,
    canSeeWhoLikedYou: false,
    showLikesInAdvancedHome: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    code: Plan.GOLD,
    name: 'Gold',
    description:
      'Includes Plus features and shows who liked you in the advanced home.',
    durationDays: 30,
    isActive: true,
    sortOrder: 2,
    canReverseLastSwipe: true,
    canChangeSwipeDecision: true,
    canSeeWhoLikedYou: true,
    showLikesInAdvancedHome: true,
  },
];

@Injectable()
export class SubscriptionsService {
  private defaultPlansPromise: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async listPlans() {
    await this.ensureDefaultPlans();
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      plans: plans.map((plan) => this.mapPlan(plan)),
    };
  }

  async getCurrentSubscriptionForUser(
    userId: string,
  ): Promise<CurrentSubscriptionSummary | null> {
    await this.ensureDefaultPlans();

    const [activeSubscription, freePlan] = await Promise.all([
      this.findActiveUserSubscription(userId),
      this.prisma.subscriptionPlan.findUnique({
        where: {
          code: Plan.FREE,
        },
      }),
    ]);

    if (activeSubscription) {
      return this.mapUserSubscription(activeSubscription);
    }

    if (!freePlan || !freePlan.isActive) {
      return null;
    }

    return {
      ...this.mapPlan(freePlan),
      id: null,
      isDefault: true,
      startAt: null,
      endAt: null,
      cancelledAt: null,
    };
  }

  async getUserSubscriptions(userId: string) {
    await this.ensureDefaultPlans();

    const [activeSubscription, subscriptions] = await Promise.all([
      this.getCurrentSubscriptionForUser(userId),
      this.prisma.userSubscription.findMany({
        where: {
          userId,
        },
        orderBy: [{ startAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          subscriptionPlan: true,
        },
      }),
    ]);

    return {
      activeSubscription,
      subscriptions: subscriptions.map((subscription) =>
        this.mapUserSubscription(subscription),
      ),
    };
  }

  async activateSubscription(userId: string, plan: Plan) {
    await this.ensureDefaultPlans();

    const planRecord = await this.prisma.subscriptionPlan.findUnique({
      where: {
        code: plan,
      },
    });

    if (!planRecord || !planRecord.isActive) {
      throw new NotFoundException('Subscription plan not found');
    }

    const now = new Date();
    const endAt = new Date(now.getTime() + planRecord.durationDays * DAY_IN_MS);

    const subscription = await this.prisma.$transaction(async (tx) => {
      await tx.userSubscription.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
          cancelledAt: now,
        },
      });

      return tx.userSubscription.create({
        data: {
          userId,
          subscriptionPlanId: planRecord.id,
          plan: planRecord.code,
          startAt: now,
          endAt,
          isActive: true,
        },
        include: {
          subscriptionPlan: true,
        },
      });
    });

    return {
      activeSubscription: this.mapUserSubscription(subscription),
    };
  }

  async hasFeature(userId: string, feature: keyof SubscriptionFeatures) {
    const activeSubscription = await this.getCurrentSubscriptionForUser(userId);

    return activeSubscription?.features[feature] ?? false;
  }

  private async ensureDefaultPlans() {
    if (!this.defaultPlansPromise) {
      this.defaultPlansPromise = Promise.all(
        DEFAULT_SUBSCRIPTION_PLANS.map((plan) =>
          this.prisma.subscriptionPlan.upsert({
            where: {
              code: plan.code,
            },
            create: plan,
            update: {
              name: plan.name,
              description: plan.description,
              durationDays: plan.durationDays,
              isActive: plan.isActive,
              sortOrder: plan.sortOrder,
              canReverseLastSwipe: plan.canReverseLastSwipe,
              canChangeSwipeDecision: plan.canChangeSwipeDecision,
              canSeeWhoLikedYou: plan.canSeeWhoLikedYou,
              showLikesInAdvancedHome: plan.showLikesInAdvancedHome,
            },
          }),
        ),
      )
        .then(() => undefined)
        .catch((error) => {
          this.defaultPlansPromise = null;
          throw error;
        });
    }

    await this.defaultPlansPromise;
  }

  private findActiveUserSubscription(userId: string) {
    return this.prisma.userSubscription.findFirst({
      where: {
        userId,
        isActive: true,
        endAt: {
          gt: new Date(),
        },
      },
      orderBy: [{ endAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        subscriptionPlan: true,
      },
    });
  }

  private mapPlan(plan: SubscriptionPlanRecord) {
    return {
      planId: plan.id,
      plan: plan.code,
      name: plan.name,
      description: plan.description,
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      isDefault: false,
      features: {
        canReverseLastSwipe: plan.canReverseLastSwipe,
        canChangeSwipeDecision: plan.canChangeSwipeDecision,
        canSeeWhoLikedYou: plan.canSeeWhoLikedYou,
        showLikesInAdvancedHome: plan.showLikesInAdvancedHome,
      },
    };
  }

  private mapUserSubscription(subscription: UserSubscriptionRecord) {
    return {
      ...this.mapPlan(subscription.subscriptionPlan),
      id: subscription.id,
      plan: subscription.plan,
      isActive: subscription.isActive && subscription.endAt > new Date(),
      isDefault: false,
      startAt: subscription.startAt,
      endAt: subscription.endAt,
      cancelledAt: subscription.cancelledAt,
    };
  }
}
