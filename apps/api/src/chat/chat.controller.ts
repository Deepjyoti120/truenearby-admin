import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}

@Controller('chats')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':chatId')
  getChat(
    @Param('chatId') chatId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.chatService.getChat(chatId, user.id);
  }

  @Get(':chatId/messages')
  getMessages(
    @Param('chatId') chatId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(chatId, user.id, limit);
  }

  @Post(':chatId/messages')
  createMessage(
    @Param('chatId') chatId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateMessageDto,
  ) {
    return this.chatService.createMessageForUser(chatId, user.id, body.content);
  }
}
