import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, LookingFor } from '../../generated/prisma/enums';

export class CreateProfileDto {
  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({ enum: LookingFor })
  @IsEnum(LookingFor)
  lookingFor!: LookingFor;

  @ApiProperty({ example: '1998-05-20' })
  @IsDateString()
  birthDate!: string;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(120)
  @Max(230)
  heightCm?: number;

  @ApiPropertyOptional({ example: 'Love travelling & coffee ☕' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['travel', 'coffee', 'music'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  interests?: string[];

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  preferredMinAge?: number;

  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  preferredMaxAge?: number;

  @ApiProperty({ example: 28.6139 })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: 77.209 })
  @IsLongitude()
  longitude!: number;

  // @ApiPropertyOptional({ example: 'Delhi' })
  // @IsOptional()
  // @IsString()
  // city?: string;

  // @ApiPropertyOptional({ example: 'India' })
  // @IsOptional()
  // @IsString()
  // country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2200)
  @ApiProperty({ type: 'string', example: 'Weekend vibes' })
  prompt?: string;
}
