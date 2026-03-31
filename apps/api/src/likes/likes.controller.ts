import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Plan } from '../generated/prisma/enums';
import { LikesService } from './likes.service';

class UnlockLikesDto {
  @IsOptional()
  @IsEnum(Plan)
  plan?: Plan;
}

@Controller('likes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get()
  getLikes(@CurrentUser() user: { id: string }) {
    return this.likesService.getLikes(user.id);
  }

  @Post(':fromUserId/accept')
  acceptLike(
    @CurrentUser() user: { id: string },
    @Param('fromUserId', new ParseUUIDPipe()) fromUserId: string,
  ) {
    return this.likesService.acceptLike(user.id, fromUserId);
  }

  @Post('unlock')
  unlockLikes(
    @CurrentUser() user: { id: string },
    @Body() body: UnlockLikesDto,
  ) {
    return this.likesService.unlockLikes(user.id, body.plan ?? Plan.GOLD);
  }
}
