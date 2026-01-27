import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'token-*****' })
  fcmToken: string;

  @IsString()
  @IsIn(['android', 'ios', 'web'])
  @ApiProperty({ example: 'android', enum: ['android', 'ios', 'web'] })
  platform: string;
}
