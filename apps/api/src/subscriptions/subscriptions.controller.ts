import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ActivateSubscriptionDto } from './dto/activate-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  listPlans() {
    return this.subscriptionsService.listPlans();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMySubscriptions(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.getUserSubscriptions(user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('activate')
  activateSubscription(
    @CurrentUser() user: { id: string },
    @Body() dto: ActivateSubscriptionDto,
  ) {
    return this.subscriptionsService.activateSubscription(user.id, dto.plan);
  }
}
