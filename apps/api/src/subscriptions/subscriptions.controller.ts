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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ActivateSubscriptionDto } from './dto/activate-subscription.dto';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { ListSubscriptionPlansDto } from './dto/list-subscription-plans.dto';
import { SetPlanActiveDto } from './dto/set-plan-active.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@ApiBearerAuth('access-token')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  listPlans() {
    return this.subscriptionsService.listPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMySubscriptions(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.getUserSubscriptions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('activate')
  activateSubscription(
    @CurrentUser() user: { id: string },
    @Body() dto: ActivateSubscriptionDto,
  ) {
    return this.subscriptionsService.activateSubscription(user.id, dto.plan);
  }

  // ---- Admin plan management ----

  @UseGuards(JwtAuthGuard)
  @Get('plans')
  listAdminPlans(@Query() query: ListSubscriptionPlansDto) {
    return this.subscriptionsService.listPlansPaginated(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('plans')
  createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('plans/:id')
  updatePlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('plans/:id/active')
  setPlanActive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetPlanActiveDto,
  ) {
    return this.subscriptionsService.setPlanActive(id, dto.isActive);
  }
}
