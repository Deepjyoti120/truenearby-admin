import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  const chatService = {
    ensureChatAccess: jest.fn(),
    createMessageForUser: jest.fn(),
  };
  const wsJwtGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };
  const jwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: chatService,
        },
        {
          provide: WsJwtGuard,
          useValue: wsJwtGuard,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as any;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('uses the authenticated socket user as sender', async () => {
    chatService.createMessageForUser.mockResolvedValue({
      id: 'msg-1',
      chatId: 'chat-1',
    });

    const client = {
      user: { id: 'user-1' },
    } as any;

    await gateway.sendMessage(
      { chatId: 'chat-1', content: 'hello' },
      client,
    );

    expect(chatService.createMessageForUser).toHaveBeenCalledWith(
      'chat-1',
      'user-1',
      'hello',
    );
  });
});
