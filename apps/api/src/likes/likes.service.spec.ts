import { Test, TestingModule } from '@nestjs/testing';
import { Plan } from '../generated/prisma/enums';
import { LikesService } from './likes.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

describe('LikesService', () => {
  let service: LikesService;
  const prisma = {
    like: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    match: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };
  const subscriptionsService = {
    getCurrentSubscriptionForUser: jest.fn(),
    activateSubscription: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: SubscriptionsService,
          useValue: subscriptionsService,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns pending received likes and hides matched users', async () => {
    subscriptionsService.getCurrentSubscriptionForUser.mockResolvedValue({
      id: null,
      planId: 'plan-free',
      plan: Plan.FREE,
      name: 'Free',
      description: 'Free plan',
      durationDays: 30,
      isActive: true,
      isDefault: true,
      startAt: null,
      endAt: null,
      cancelledAt: null,
      features: {
        canReverseLastSwipe: false,
        canChangeSwipeDecision: false,
        canSeeWhoLikedYou: false,
        showLikesInAdvancedHome: false,
      },
    });
    prisma.like.findMany.mockResolvedValue([
      {
        id: 'like-1',
        fromUserId: 'user-2',
        createdAt: new Date('2026-03-29T10:00:00.000Z'),
        fromUser: {
          id: 'user-2',
          email: 'user2@example.com',
          phone: null,
          profile: { name: 'Hazel', city: 'Guwahati' },
          photos: [{ url: 'https://cdn.example.com/photo.jpg', isPrimary: true }],
        },
      },
      {
        id: 'like-2',
        fromUserId: 'user-3',
        createdAt: new Date('2026-03-29T11:00:00.000Z'),
        fromUser: {
          id: 'user-3',
          email: 'user3@example.com',
          phone: null,
          profile: { name: 'Ivy', city: 'Shillong' },
          photos: [],
        },
      },
    ]);
    prisma.match.findMany.mockResolvedValue([
      { userAId: 'user-1', userBId: 'user-3' },
    ]);

    const result = await service.getLikes('user-1');

    expect(result.totalLikes).toBe(1);
    expect(result.likes[0]?.fromUserId).toBe('user-2');
    expect(result.likes[0]?.isLocked).toBe(true);
    expect(result.activeSubscription?.plan).toBe(Plan.FREE);
  });
});
