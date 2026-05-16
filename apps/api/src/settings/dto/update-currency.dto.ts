import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

// ISO 4217 currency codes supported by the catalog. Extend as needed.
export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'CAD',
  'AUD',
  'JPY',
  'SGD',
  'AED',
  'BRL',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export class UpdateCurrencyDto {
  @ApiProperty({
    enum: SUPPORTED_CURRENCIES,
    example: 'USD',
    description: 'ISO 4217 currency code applied to all subscription prices',
  })
  @IsIn(SUPPORTED_CURRENCIES as readonly string[])
  currency!: SupportedCurrency;
}
