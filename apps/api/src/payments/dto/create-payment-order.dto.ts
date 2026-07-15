import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePaymentOrderDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID of the paid subscription plan (SKU) to buy.',
  })
  @IsUUID()
  planId!: string;
}
