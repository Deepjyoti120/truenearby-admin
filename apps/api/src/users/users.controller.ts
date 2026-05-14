import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NearbyDto } from './dto/nearby.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { SwipeDto } from './dto/swipe.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Query() query: ListUsersDto) {
    return this.usersService.listUsers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.usersService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/active')
  async setUserActive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetUserActiveDto,
  ) {
    return this.usersService.setUserActive(id, dto.isActive);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getCurrentUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateCurrentUser(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateCurrentUserDto,
  ) {
    return this.usersService.updateCurrentUser(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('nearby')
  async getNearbyUsers(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: NearbyDto,
  ) {
    const users = await this.usersService.getNearbyUsersHybrid(
      user.id,
      query.latitude,
      query.longitude,
      query.radiusKm,
      query.limit,
      query.page,
    );
    return {
      meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        radiusKm: query.radiusKm ?? 20,
      },
      data: users,
    };
  }
  @Post('swipe')
  @UseGuards(JwtAuthGuard)
  async swipe(@CurrentUser() user: CurrentUserPayload, @Body() dto: SwipeDto) {
    return this.usersService.swipe(user.id, dto);
  }
}
