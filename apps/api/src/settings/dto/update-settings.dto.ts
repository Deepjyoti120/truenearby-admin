import {
  registerDecorator,
  type ValidationOptions,
  type ValidationArguments,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { isSupportedCurrency } from '../currencies';

// Custom validator: accepts any ISO 4217 code recognised by the runtime
// `Intl.supportedValuesOf('currency')` (~157 active currencies).
function IsSupportedCurrency(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSupportedCurrency',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isSupportedCurrency(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a supported ISO 4217 currency code`;
        },
      },
    });
  };
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    example: 'USD',
    description: 'ISO 4217 currency code applied to all subscription prices',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsSupportedCurrency()
  currency?: string;

  @ApiPropertyOptional({
    example: 'Dating Admin',
    minLength: 1,
    maxLength: 60,
    description: 'Brand/app name shown in the admin UI',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 60)
  appName?: string;
}
