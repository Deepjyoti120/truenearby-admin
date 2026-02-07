import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(chatId: string, senderId: string, content: string) {
    return this.prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
      },
    });
  }
}
// Join chat
// socket.emit("joinChat", {
//    chatId: "CHAT_ID"
// })
// Send message
// socket.emit("sendMessage", {
//    chatId: "CHAT_ID",
//    senderId: "USER_ID",
//    content: "hello"
// })
// Receive live message
// socket.on("newMessage", (msg) => {
//    console.log(msg)
// })
