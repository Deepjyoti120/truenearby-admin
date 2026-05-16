import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Plan } from '../../generated/prisma/enums';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ enum: Plan, example: Plan.PLUS })
  @IsEnum(Plan)
  code!: Plan;

  @ApiProperty({ example: '7-Day Plus' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Weekly Plus subscription' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 7, minimum: 1 })
  @IsInt()
  @Min(1)
  durationDays!: number;

  @ApiProperty({
    example: 9.99,
    minimum: 0,
    description:
      'Price in the currency configured in app settings (see GET /settings).',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: 20, description: 'Max swipes per day (enforced by mobile)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  dailySwipeLimit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  dailySuperLikes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyBoosts?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canReverseLastSwipe?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canChangeSwipeDecision?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canSeeWhoLikedYou?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  showLikesInAdvancedHome?: boolean;

  @ApiPropertyOptional({ default: false, description: 'See likes clearly (vs blurred)' })
  @IsOptional()
  @IsBoolean()
  canUnblurLikes?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canPassport?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hideAds?: boolean;
}
