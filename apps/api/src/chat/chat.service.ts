import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CHAT_MESSAGE_SELECT, CHAT_PARTICIPANT_SELECT } from './chat.selects';
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultMessageLimit = 50;
  private readonly maxMessageLimit = 100;

  private normalizeMessageLimit(limit?: string) {
    if (!limit) {
      return this.defaultMessageLimit;
    }

    const parsed = Number(limit);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('limit must be a positive integer');
    }

    return Math.min(parsed, this.maxMessageLimit);
  }

  async ensureChatAccess(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        matchId: true,
        match: {
          select: {
            id: true,
            userAId: true,
            userBId: true,
            userA: {
              select: CHAT_PARTICIPANT_SELECT,
            },
            userB: {
              select: CHAT_PARTICIPANT_SELECT,
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant =
      chat.match.userAId === userId || chat.match.userBId === userId;

    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this chat');
    }

    return chat;
  }

  async getChat(chatId: string, userId: string) {
    const chat = await this.ensureChatAccess(chatId, userId);
    const otherUser =
      chat.match.userAId === userId ? chat.match.userB : chat.match.userA;

    return {
      chatId: chat.id,
      matchId: chat.matchId,
      participant: otherUser,
    };
  }

  async getMessages(chatId: string, userId: string, limit?: string) {
    await this.ensureChatAccess(chatId, userId);

    const normalizedLimit = this.normalizeMessageLimit(limit);
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      select: CHAT_MESSAGE_SELECT,
      orderBy: { createdAt: 'desc' },
      take: normalizedLimit,
    });

    return {
      chatId,
      messages: messages.reverse(),
    };
  }

  async createMessageForUser(chatId: string, senderId: string, content: string) {
    const trimmedContent = content?.trim();

    if (!trimmedContent) {
      throw new BadRequestException('Message content is required');
    }

    await this.ensureChatAccess(chatId, senderId);

    return this.prisma.message.create({
      data: {
        chatId,
        senderId,
        content: trimmedContent,
      },
      select: CHAT_MESSAGE_SELECT,
    });
  }
}
