import { Controller, Get, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchService: MatchesService) {}

  @Get('matches')
  @UseGuards(JwtAuthGuard)
  getMatches(@CurrentUser() user: CurrentUserPayload) {
    return this.matchService.getMatches(user.id);
  }
}
