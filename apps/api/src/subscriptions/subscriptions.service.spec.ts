import { Test, TestingModule } from '@nestjs/testing';
import { Plan } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from './subscriptions.service';

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
    prisma.subscriptionPlan.findMany.mockResolvedValue([
      {
        id: 'plan-plus',
        code: Plan.PLUS,
        name: 'Plus',
        description: 'Plus plan',
        durationDays: 30,
        isActive: true,
        sortOrder: 1,
        canReverseLastSwipe: true,
        canChangeSwipeDecision: true,
        canSeeWhoLikedYou: false,
        showLikesInAdvancedHome: false,
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      },
    ]);

    const result = await service.listPlans();

    expect(prisma.subscriptionPlan.upsert).toHaveBeenCalledTimes(3);
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
        name: 'Plus',
        description: 'Plus plan',
        durationDays: 30,
        isActive: true,
        isDefault: false,
        features: {
          canReverseLastSwipe: true,
          canChangeSwipeDecision: true,
          canSeeWhoLikedYou: false,
          showLikesInAdvancedHome: false,
        },
      },
    ]);
  });

  it('activates a subscription and stores it in user_subscriptions', async () => {
    const plusPlan = {
      id: 'plan-plus',
      code: Plan.PLUS,
      name: 'Plus',
      description: 'Plus plan',
      durationDays: 30,
      isActive: true,
      sortOrder: 1,
      canReverseLastSwipe: true,
      canChangeSwipeDecision: true,
      canSeeWhoLikedYou: false,
      showLikesInAdvancedHome: false,
      createdAt: new Date('2026-03-31T10:00:00.000Z'),
      updatedAt: new Date('2026-03-31T10:00:00.000Z'),
    };
    const createdSubscription = {
      id: 'sub-1',
      userId: 'user-1',
      subscriptionPlanId: 'plan-plus',
      plan: Plan.PLUS,
      startAt: new Date('2026-03-31T12:00:00.000Z'),
      endAt: new Date('2026-04-30T12:00:00.000Z'),
      isActive: true,
      cancelledAt: null,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
      updatedAt: new Date('2026-03-31T12:00:00.000Z'),
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

    const result = await service.activateSubscription('user-1', Plan.PLUS);

    expect(prisma.subscriptionPlan.findUnique).toHaveBeenCalledWith({
      where: {
        code: Plan.PLUS,
      },
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
      name: 'Plus',
      description: 'Plus plan',
      durationDays: 30,
      isActive: true,
      isDefault: false,
      startAt: createdSubscription.startAt,
      endAt: createdSubscription.endAt,
      cancelledAt: null,
      features: {
        canReverseLastSwipe: true,
        canChangeSwipeDecision: true,
        canSeeWhoLikedYou: false,
        showLikesInAdvancedHome: false,
      },
    });
  });
});
