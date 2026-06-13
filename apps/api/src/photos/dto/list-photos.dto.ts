import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export type PhotoVerifiedFilter = 'verified' | 'unverified' | 'all';

export class ListPhotosDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by owner email or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['verified', 'unverified', 'all'],
    default: 'unverified',
    description: 'Filter by verification status',
  })
  @IsOptional()
  @IsIn(['verified', 'unverified', 'all'])
  verified?: PhotoVerifiedFilter = 'unverified';
}

export class VerifyPhotosDto {
  @ApiPropertyOptional({ type: [String], description: 'Photo ids to update' })
  @IsString({ each: true })
  ids!: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
