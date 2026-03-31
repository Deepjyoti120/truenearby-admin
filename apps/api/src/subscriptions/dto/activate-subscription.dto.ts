import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Plan } from '../../generated/prisma/enums';

export class ActivateSubscriptionDto {
  @ApiProperty({
    enum: Plan,
    example: Plan.GOLD,
    description: 'Subscription plan to activate for the current user',
  })
  @IsEnum(Plan)
  plan!: Plan;
}
