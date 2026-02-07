import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [ChatService, ChatGateway, PrismaService],
  imports: [AuthModule],
})
export class ChatModule {}
