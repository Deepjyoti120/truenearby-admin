import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt/ws-jwt.guard';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

type AuthenticatedSocket = Socket & {
  user: CurrentUserPayload;
};

@WebSocketGateway({
  cors: true,
})
@UseGuards(WsJwtGuard)
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  broadcastNewMessage(chatId: string, message: unknown) {
    console.error(message);
    this.server?.to(chatId).emit('newMessage', message);
  }

  @SubscribeMessage('joinChat')
  async joinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    await this.chatService.ensureChatAccess(data.chatId, client.user.id);
    void client.join(data.chatId);
    return { chatId: data.chatId };
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody()
    data: {
      chatId: string;
      content: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const message = await this.chatService.createMessageForUser(
      data.chatId,
      client.user.id,
      data.content,
    );

    this.broadcastNewMessage(data.chatId, message);
    return message;
  }
}
