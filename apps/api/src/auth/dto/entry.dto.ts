import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthEntryDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: '9876543210',
    description: 'User phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Password@123',
    description: 'Required for first-time registration',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    example: 'fcm_token_here',
    description: 'Firebase Cloud Messaging token',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;

  @ApiPropertyOptional({
    example: 'android',
    description: 'Device platform (android | ios | web)',
  })
  @IsOptional()
  @IsString()
  platform?: string;
}
