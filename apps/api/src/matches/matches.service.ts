import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CHAT_MESSAGE_SELECT,
  CHAT_PARTICIPANT_SELECT,
} from '../chat/chat.selects';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatches(currentUserId: string) {
    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [{ blockerId: currentUserId }, { blockedId: currentUserId }],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    const blockedUserIds = blocks.map((block) =>
      block.blockerId === currentUserId ? block.blockedId : block.blockerId,
    );

    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          {
            userAId: currentUserId,
            userBId: {
              notIn: blockedUserIds,
            },
            userB: {
              isActive: true,
            },
          },
          {
            userBId: currentUserId,
            userAId: {
              notIn: blockedUserIds,
            },
            userA: {
              isActive: true,
            },
          },
        ],
      },
      select: {
        id: true,
        userAId: true,
        userBId: true,
        createdAt: true,
        userA: {
          select: CHAT_PARTICIPANT_SELECT,
        },
        userB: {
          select: CHAT_PARTICIPANT_SELECT,
        },
        chat: {
          select: {
            id: true,
            createdAt: true,
            messages: {
              select: CHAT_MESSAGE_SELECT,
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return matches.map((match) => {
      const otherUser =
        match.userAId === currentUserId ? match.userB : match.userA;

      return {
        matchId: match.id,
        createdAt: match.createdAt,
        chatId: match.chat?.id,
        chatCreatedAt: match.chat?.createdAt ?? null,
        latestMessage: match.chat?.messages[0] ?? null,
        user: otherUser,
      };
    });
  }
}
