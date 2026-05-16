import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Plan, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { ListSubscriptionPlansDto } from './dto/list-subscription-plans.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';

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
  dailySwipeLimit: number;
  dailySuperLikes: number;
  monthlyBoosts: number;
  canUnblurLikes: boolean;
  canPassport: boolean;
  hideAds: boolean;
  price: number;
};

// `price` comes back from Prisma as a Decimal instance (or a Decimal-like
// object). We accept either so the seed (plain number) and the live records
// share the same record type.
type SubscriptionPlanRecord = Omit<SubscriptionPlanSeed, 'price'> & {
  price: Prisma.Decimal | number;
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
  dailySwipeLimit: number;
  dailySuperLikes: number;
  monthlyBoosts: number;
  canUnblurLikes: boolean;
  canPassport: boolean;
  hideAds: boolean;
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

const FREE_PLAN_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlanSeed[] = [
  {
    id: FREE_PLAN_ID,
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
    dailySwipeLimit: 20,
    dailySuperLikes: 0,
    monthlyBoosts: 0,
    canUnblurLikes: false,
    canPassport: false,
    hideAds: false,
    price: 0,
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

  async listPlansPaginated(dto: ListSubscriptionPlansDto) {
    await this.ensureDefaultPlans();

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = dto.search?.trim();

    const where: Prisma.SubscriptionPlanWhereInput = {
      ...(dto.code ? { code: dto.code } : {}),
      ...(typeof dto.isActive === 'boolean' ? { isActive: dto.isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.subscriptionPlan.count({ where }),
      this.prisma.subscriptionPlan.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items.map((plan) => ({
        ...this.mapPlan(plan),
        isDefault: plan.code === Plan.FREE,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async createPlan(dto: CreateSubscriptionPlanDto) {
    await this.ensureDefaultPlans();

    if (dto.code === Plan.FREE) {
      throw new BadRequestException(
        'The FREE plan is managed by the system and cannot be created manually',
      );
    }

    // Multiple SKUs per tier are allowed (e.g. 7-day Gold + 30-day Gold), so
    // we no longer reject duplicates by `code`. The DB-level partial unique
    // index will still catch any attempt to insert a second FREE row.

    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        durationDays: dto.durationDays,
        price: dto.price,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        canReverseLastSwipe: dto.canReverseLastSwipe ?? false,
        canChangeSwipeDecision: dto.canChangeSwipeDecision ?? false,
        canSeeWhoLikedYou: dto.canSeeWhoLikedYou ?? false,
        showLikesInAdvancedHome: dto.showLikesInAdvancedHome ?? false,
        dailySwipeLimit: dto.dailySwipeLimit ?? 20,
        dailySuperLikes: dto.dailySuperLikes ?? 0,
        monthlyBoosts: dto.monthlyBoosts ?? 0,
        canUnblurLikes: dto.canUnblurLikes ?? false,
        canPassport: dto.canPassport ?? false,
        hideAds: dto.hideAds ?? false,
      },
    });

    return this.mapPlan(plan);
  }

  async updatePlan(id: string, dto: UpdateSubscriptionPlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const data: Prisma.SubscriptionPlanUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.durationDays !== undefined) data.durationDays = dto.durationDays;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.dailySwipeLimit !== undefined)
      data.dailySwipeLimit = dto.dailySwipeLimit;
    if (dto.dailySuperLikes !== undefined)
      data.dailySuperLikes = dto.dailySuperLikes;
    if (dto.monthlyBoosts !== undefined) data.monthlyBoosts = dto.monthlyBoosts;
    if (dto.canReverseLastSwipe !== undefined)
      data.canReverseLastSwipe = dto.canReverseLastSwipe;
    if (dto.canChangeSwipeDecision !== undefined)
      data.canChangeSwipeDecision = dto.canChangeSwipeDecision;
    if (dto.canSeeWhoLikedYou !== undefined)
      data.canSeeWhoLikedYou = dto.canSeeWhoLikedYou;
    if (dto.showLikesInAdvancedHome !== undefined)
      data.showLikesInAdvancedHome = dto.showLikesInAdvancedHome;
    if (dto.canUnblurLikes !== undefined)
      data.canUnblurLikes = dto.canUnblurLikes;
    if (dto.canPassport !== undefined) data.canPassport = dto.canPassport;
    if (dto.hideAds !== undefined) data.hideAds = dto.hideAds;

    if (dto.isActive !== undefined) {
      if (plan.code === Plan.FREE && dto.isActive === false) {
        throw new ForbiddenException(
          'The FREE plan cannot be deactivated — it is the system default',
        );
      }
      data.isActive = dto.isActive;
    }

    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data,
    });

    return {
      ...this.mapPlan(updated),
      isDefault: updated.code === Plan.FREE,
    };
  }

  async setPlanActive(id: string, isActive: boolean) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    if (plan.code === Plan.FREE && !isActive) {
      throw new ForbiddenException(
        'The FREE plan cannot be deactivated — it is the system default',
      );
    }

    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive },
    });

    return {
      ...this.mapPlan(updated),
      isDefault: updated.code === Plan.FREE,
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
          id: FREE_PLAN_ID,
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

  async activateSubscription(userId: string, planId: string) {
    await this.ensureDefaultPlans();

    const planRecord = await this.prisma.subscriptionPlan.findUnique({
      where: {
        id: planId,
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
              id: plan.id,
            },
            create: plan,
            update: {
              // Only re-assert system-managed fields. Editable copy
              // (name/description/limits) is preserved across restarts so
              // admins can tune the FREE plan without it being overwritten.
              isActive: true,
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
      price: this.priceToNumber(plan.price),
      isActive: plan.isActive,
      isDefault: false,
      sortOrder: plan.sortOrder,
      features: {
        canReverseLastSwipe: plan.canReverseLastSwipe,
        canChangeSwipeDecision: plan.canChangeSwipeDecision,
        canSeeWhoLikedYou: plan.canSeeWhoLikedYou,
        showLikesInAdvancedHome: plan.showLikesInAdvancedHome,
        dailySwipeLimit: plan.dailySwipeLimit,
        dailySuperLikes: plan.dailySuperLikes,
        monthlyBoosts: plan.monthlyBoosts,
        canUnblurLikes: plan.canUnblurLikes,
        canPassport: plan.canPassport,
        hideAds: plan.hideAds,
      },
    };
  }

  private priceToNumber(price: Prisma.Decimal | number): number {
    if (typeof price === 'number') return price;
    // Prisma.Decimal has a `.toNumber()` helper. Fall back to Number()
    // when serializers strip prototype methods (e.g. in tests).
    return typeof (price as Prisma.Decimal).toNumber === 'function'
      ? (price as Prisma.Decimal).toNumber()
      : Number(price);
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
