import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

describe('ChatController', () => {
  let controller: ChatController;
  const chatService = {
    getChat: jest.fn(),
    getMessages: jest.fn(),
    createMessageForUser: jest.fn(),
  };
  const chatGateway = {
    broadcastNewMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: chatService,
        },
        {
          provide: ChatGateway,
          useValue: chatGateway,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a message for the authenticated user', async () => {
    chatService.createMessageForUser.mockResolvedValue({
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      content: 'hello',
    });

    await controller.createMessage(
      'chat-1',
      { id: 'user-1' },
      { content: 'hello' },
    );

    expect(chatService.createMessageForUser).toHaveBeenCalledWith(
      'chat-1',
      'user-1',
      'hello',
    );
    expect(chatGateway.broadcastNewMessage).toHaveBeenCalledWith('chat-1', {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      content: 'hello',
    });
  });
});
