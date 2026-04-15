import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CHAT_PARTICIPANT_SELECT } from '../chat/chat.selects';
import { Plan } from '../generated/prisma/enums';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async getLikes(currentUserId: string) {
    const activeSubscription =
      await this.subscriptionsService.getCurrentSubscriptionForUser(
        currentUserId,
      );
    const isUnlocked = activeSubscription?.features.canSeeWhoLikedYou ?? false;
    const [likes, matches] = await Promise.all([
      this.prisma.like.findMany({
        where: {
          toUserId: currentUserId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          fromUser: {
            select: CHAT_PARTICIPANT_SELECT,
          },
        },
      }),
      this.prisma.match.findMany({
        where: {
          OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
        },
        select: {
          userAId: true,
          userBId: true,
        },
      }),
    ]);

    const matchedUserIds = new Set(
      matches.map((match) =>
        match.userAId === currentUserId ? match.userBId : match.userAId,
      ),
    );

    const pendingLikes = likes
      .filter((like) => !matchedUserIds.has(like.fromUserId))
      .map((like) => {
        const previewPhoto =
          like.fromUser.photos.find((photo) => photo.isPrimary)?.url ??
          like.fromUser.photos[0]?.url ??
          null;
        return {
          id: like.id,
          fromUserId: like.fromUserId,
          createdAt: like.createdAt,
          isLocked: !isUnlocked,
          user: {
            ...like.fromUser,
            previewPhoto,
          },
        };
      });

    return {
      isUnlocked,
      totalLikes: pendingLikes.length,
      likes: pendingLikes,
      featuredLike: pendingLikes.length === 0 ? null : pendingLikes[0],
      activeSubscription,
    };
  }

  async acceptLike(currentUserId: string, fromUserId: string) {
    if (currentUserId == fromUserId) {
      throw new BadRequestException('Cannot accept your own like');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId: currentUserId,
        },
      },
      select: { id: true },
    });

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.like.upsert({
        where: {
          fromUserId_toUserId: {
            fromUserId: currentUserId,
            toUserId: fromUserId,
          },
        },
        update: {},
        create: {
          fromUserId: currentUserId,
          toUserId: fromUserId,
        },
      });

      const [userAId, userBId] =
        currentUserId < fromUserId
          ? [currentUserId, fromUserId]
          : [fromUserId, currentUserId];

      const match = await tx.match.upsert({
        where: {
          userAId_userBId: {
            userAId,
            userBId,
          },
        },
        update: {},
        create: {
          userAId,
          userBId,
          chat: {
            create: {},
          },
        },
        include: {
          chat: true,
        },
      });

      return match;
    });

    return {
      matched: true,
      matchId: result.id,
      chatId: result.chat?.id ?? null,
      userId: fromUserId,
    };
  }

  async unlockLikes(currentUserId: string, plan: Plan = Plan.GOLD) {
    const { activeSubscription } =
      await this.subscriptionsService.activateSubscription(currentUserId, plan);

    return {
      unlocked: activeSubscription.features.canSeeWhoLikedYou,
      activeSubscription,
    };
  }
}
