import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  @ApiProperty({ type: 'string', example: 'Weekend vibes' })
  prompt?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return Number(value);
  })
  @IsNumber()
  @ApiProperty({ example: 77.209, type: 'number', nullable: true })
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return Number(value);
  })
  @IsNumber()
  @ApiProperty({ example: 28.6139, type: 'number', nullable: true })
  longitude?: number;

  @IsOptional()
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  images?: any[];
}
