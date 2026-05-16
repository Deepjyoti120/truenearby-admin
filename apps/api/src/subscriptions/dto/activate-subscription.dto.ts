import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ActivateSubscriptionDto {
  @ApiProperty({
    format: 'uuid',
    example: '00000000-0000-0000-0000-000000000001',
    description:
      'ID of the subscription plan (SKU) to activate. Pass the seeded FREE id (00000000-0000-0000-0000-000000000001) to switch back to the free tier after a paid subscription ends.',
  })
  @IsUUID()
  planId!: string;
}
