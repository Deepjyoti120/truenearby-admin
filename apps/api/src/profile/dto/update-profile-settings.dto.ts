import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileSettingsDto {
  @IsOptional()
  @IsString()
  profileName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
