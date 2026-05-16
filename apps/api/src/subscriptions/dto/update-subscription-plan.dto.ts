import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSubscriptionPlanDto } from './create-subscription-plan.dto';

export class UpdateSubscriptionPlanDto extends PartialType(
  OmitType(CreateSubscriptionPlanDto, ['code'] as const),
) {}
