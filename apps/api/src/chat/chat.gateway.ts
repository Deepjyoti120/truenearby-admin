import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: true,
})
export class ChatGateway {
  constructor(private chatService: ChatService) {}
  @SubscribeMessage('joinChat')
  joinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(data.chatId);
  }
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody()
    data: {
      chatId: string;
      senderId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage(
      data.chatId,
      data.senderId,
      data.content,
    );
    client.to(data.chatId).emit('newMessage', message);
    client.emit('newMessage', message);
    console.log('Message sent:', message);
    return message;
  }
}
