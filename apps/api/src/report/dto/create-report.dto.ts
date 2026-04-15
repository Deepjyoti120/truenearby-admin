import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid-of-reported-user' })
  reportedUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2200)
  @ApiProperty({ type: 'string', example: 'Bad User' })
  description?: string;
}
