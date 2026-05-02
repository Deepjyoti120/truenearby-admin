import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getUsers() {
    return await this.prisma.user.findMany({ where: { isActive: true } });
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
