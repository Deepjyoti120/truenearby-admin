import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}
  async getMatches(currentUserId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
      },
      include: {
        userA: {
          include: {
            profile: true,
            photos: true,
          },
        },
        userB: {
          include: {
            profile: true,
            photos: true,
          },
        },
        chat: true,
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
        chatId: match.chat?.id,
        user: otherUser,
      };
    });
  }
}
