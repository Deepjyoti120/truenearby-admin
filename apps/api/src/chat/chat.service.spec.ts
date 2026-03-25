import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;
  const prisma = {
    chat: {
      findUnique: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns messages only for chat participants', async () => {
    prisma.chat.findUnique.mockResolvedValue({
      id: 'chat-1',
      matchId: 'match-1',
      match: {
        id: 'match-1',
        userAId: 'user-1',
        userBId: 'user-2',
        userA: { id: 'user-1' },
        userB: { id: 'user-2' },
      },
    });
    prisma.message.findMany.mockResolvedValue([
      {
        id: 'msg-2',
        chatId: 'chat-1',
        senderId: 'user-2',
        content: 'hello',
        isRead: false,
        createdAt: new Date('2026-03-25T10:00:00.000Z'),
        sender: { id: 'user-2' },
      },
    ]);

    const result = await service.getMessages('chat-1', 'user-1');

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { chatId: 'chat-1' },
        take: 50,
      }),
    );
    expect(result).toEqual({
      chatId: 'chat-1',
      messages: [
        {
          id: 'msg-2',
          chatId: 'chat-1',
          senderId: 'user-2',
          content: 'hello',
          isRead: false,
          createdAt: new Date('2026-03-25T10:00:00.000Z'),
          sender: { id: 'user-2' },
        },
      ],
    });
  });
});
