import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProfileDto,
  ) {
    return this.profileService.create(user.id, dto);
  }
}
