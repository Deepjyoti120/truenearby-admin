import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MatchesService', () => {
  let service: MatchesService;
  const prisma = {
    match: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the other participant and latest message for each match', async () => {
    prisma.match.findMany.mockResolvedValue([
      {
        id: 'match-1',
        userAId: 'user-1',
        userBId: 'user-2',
        createdAt: new Date('2026-03-24T10:00:00.000Z'),
        userA: { id: 'user-1' },
        userB: { id: 'user-2', profile: { name: 'Alex' }, photos: [] },
        chat: {
          id: 'chat-1',
          createdAt: new Date('2026-03-24T10:01:00.000Z'),
          messages: [
            {
              id: 'msg-1',
              chatId: 'chat-1',
              senderId: 'user-2',
              content: 'Hi',
              isRead: false,
              createdAt: new Date('2026-03-25T09:00:00.000Z'),
              sender: { id: 'user-2' },
            },
          ],
        },
      },
    ]);

    const result = await service.getMatches('user-1');

    expect(result).toEqual([
      {
        matchId: 'match-1',
        createdAt: new Date('2026-03-24T10:00:00.000Z'),
        chatId: 'chat-1',
        chatCreatedAt: new Date('2026-03-24T10:01:00.000Z'),
        latestMessage: {
          id: 'msg-1',
          chatId: 'chat-1',
          senderId: 'user-2',
          content: 'Hi',
          isRead: false,
          createdAt: new Date('2026-03-25T09:00:00.000Z'),
          sender: { id: 'user-2' },
        },
        user: {
          id: 'user-2',
          profile: { name: 'Alex' },
          photos: [],
        },
      },
    ]);
  });
});
