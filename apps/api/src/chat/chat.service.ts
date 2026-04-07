import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CHAT_MESSAGE_SELECT, CHAT_PARTICIPANT_SELECT } from './chat.selects';
import { FirebaseService } from '../firebase/firebase.service';
@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  private readonly defaultMessageLimit = 50;
  private readonly maxMessageLimit = 100;
  private readonly logger = new Logger(ChatService.name);

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

  async createMessageForUser(
    chatId: string,
    senderId: string,
    content: string,
  ) {
    const trimmedContent = content?.trim();

    if (!trimmedContent) {
      throw new BadRequestException('Message content is required');
    }

    const chat = await this.ensureChatAccess(chatId, senderId);

    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        content: trimmedContent,
      },
      select: CHAT_MESSAGE_SELECT,
    });

    const recipientId =
      chat.match.userAId === senderId ? chat.match.userBId : chat.match.userAId;
    const sender =
      chat.match.userAId === senderId ? chat.match.userA : chat.match.userB;

    void this.sendNewMessagePush({
      recipientId,
      chatId,
      messageId: message.id,
      senderId,
      senderName:
        sender.profile?.name?.trim() ||
        sender.profile?.userName?.trim() ||
        sender.email,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    });

    return message;
  }

  private async sendNewMessagePush(params: {
    recipientId: string;
    chatId: string;
    messageId: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
  }) {
    const devices = await this.prisma.userDevice.findMany({
      where: {
        userId: params.recipientId,
        isActive: true,
      },
      select: {
        id: true,
        fcmToken: true,
      },
    });

    const tokens = devices
      .map((device) => device.fcmToken.trim())
      .filter((token) => token.length > 0);

    if (tokens.length === 0) {
      return;
    }

    const result = await this.firebaseService.sendMulticast({
      tokens,
      notification: {
        title: params.senderName,
        body: params.content,
      },
      data: {
        type: 'chat_message',
        chatId: params.chatId,
        messageId: params.messageId,
        senderId: params.senderId,
        senderName: params.senderName,
        content: params.content,
        createdAt: params.createdAt,
      },
    });

    if (result.invalidTokens.length === 0) {
      return;
    }

    await this.prisma.userDevice.updateMany({
      where: {
        fcmToken: {
          in: result.invalidTokens,
        },
      },
      data: {
        isActive: false,
      },
    });

    this.logger.warn(
      `Marked ${result.invalidTokens.length} FCM token(s) inactive for chat ${params.chatId}.`,
    );
  }
}
