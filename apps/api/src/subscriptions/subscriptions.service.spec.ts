import { Test, TestingModule } from '@nestjs/testing';
import { Plan } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from './subscriptions.service';

const PLUS_FEATURES = {
  canReverseLastSwipe: true,
  canChangeSwipeDecision: true,
  canSeeWhoLikedYou: false,
  showLikesInAdvancedHome: false,
  dailySwipeLimit: 100,
  dailySuperLikes: 5,
  monthlyBoosts: 1,
  canUnblurLikes: false,
  canPassport: false,
  hideAds: true,
};

function buildPlanRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'plan-plus',
    code: Plan.PLUS,
    name: 'Plus 30-Day',
    description: 'Plus plan',
    durationDays: 30,
    price: 9.99,
    isActive: true,
    sortOrder: 1,
    ...PLUS_FEATURES,
    createdAt: new Date('2026-03-31T10:00:00.000Z'),
    updatedAt: new Date('2026-03-31T10:00:00.000Z'),
    ...overrides,
  };
}

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  const prisma = {
    subscriptionPlan: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    userSubscription: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    jest.clearAllMocks();
  });

  it('lists seeded plans ordered by sort order', async () => {
    prisma.subscriptionPlan.upsert.mockResolvedValue(undefined);
    prisma.subscriptionPlan.findMany.mockResolvedValue([buildPlanRecord()]);

    const result = await service.listPlans();

    // Only FREE is seeded by default; PLUS/GOLD are created by the admin.
    expect(prisma.subscriptionPlan.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.subscriptionPlan.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    expect(result.plans).toEqual([
      {
        planId: 'plan-plus',
        plan: Plan.PLUS,
        name: 'Plus 30-Day',
        description: 'Plus plan',
        durationDays: 30,
        price: 9.99,
        isActive: true,
        isDefault: false,
        sortOrder: 1,
        features: PLUS_FEATURES,
      },
    ]);
  });

  it('activates a subscription by planId and stores it in user_subscriptions', async () => {
    const plusPlan = buildPlanRecord();
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const createdSubscription = {
      id: 'sub-1',
      userId: 'user-1',
      subscriptionPlanId: 'plan-plus',
      plan: Plan.PLUS,
      startAt,
      endAt,
      isActive: true,
      cancelledAt: null,
      createdAt: startAt,
      updatedAt: startAt,
      subscriptionPlan: plusPlan,
    };
    const tx = {
      userSubscription: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue(createdSubscription),
      },
    };

    prisma.subscriptionPlan.upsert.mockResolvedValue(undefined);
    prisma.subscriptionPlan.findUnique.mockResolvedValue(plusPlan);
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await service.activateSubscription('user-1', 'plan-plus', {
      allowPaid: true,
    });

    expect(prisma.subscriptionPlan.findUnique).toHaveBeenCalledWith({
      where: { id: 'plan-plus' },
    });
    expect(tx.userSubscription.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        isActive: true,
      },
      data: {
        isActive: false,
        cancelledAt: expect.any(Date),
      },
    });
    expect(tx.userSubscription.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        subscriptionPlanId: 'plan-plus',
        plan: Plan.PLUS,
        startAt: expect.any(Date),
        endAt: expect.any(Date),
        isActive: true,
      },
      include: {
        subscriptionPlan: true,
      },
    });
    expect(result.activeSubscription).toEqual({
      id: 'sub-1',
      planId: 'plan-plus',
      plan: Plan.PLUS,
      name: 'Plus 30-Day',
      description: 'Plus plan',
      durationDays: 30,
      price: 9.99,
      isActive: true,
      isDefault: false,
      sortOrder: 1,
      startAt: createdSubscription.startAt,
      endAt: createdSubscription.endAt,
      cancelledAt: null,
      features: PLUS_FEATURES,
    });
  });

  it('rejects direct activation of a paid plan without payment', async () => {
    prisma.subscriptionPlan.upsert.mockResolvedValue(undefined);
    prisma.subscriptionPlan.findUnique.mockResolvedValue(buildPlanRecord());

    await expect(
      service.activateSubscription('user-1', 'plan-plus'),
    ).rejects.toThrow('This plan requires payment');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
