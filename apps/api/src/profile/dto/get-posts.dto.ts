import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetPostsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  @ApiPropertyOptional({ example: 20, default: 20 })
  radiusKm?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiPropertyOptional({
    example: 26.1445,
    description: 'Optional latitude to rank posts by distance',
  })
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiPropertyOptional({
    example: 91.7362,
    description: 'Optional longitude to rank posts by distance',
  })
  longitude?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example:
      'eyJwb3N0SWQiOiI4M2ZhZjE4NS1jMjE3LTRjM2YtOTM2Ni0wMzk5ZDFhN2MxZDEiLCJwb3N0Q3JlYXRlZEF0IjoiMjAyNi0wMy0yMlQxMDozMDowMC4wMDBaIn0',
    description:
      'Opaque cursor for scalable feed pagination. Do not combine with page > 1.',
  })
  cursor?: string;
}
