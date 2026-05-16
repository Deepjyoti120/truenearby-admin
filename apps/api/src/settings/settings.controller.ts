import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Role } from '../generated/prisma/enums';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
@ApiBearerAuth('access-token')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // GET is JWT-only (no role gate) so the mobile catalog can read the
  // active currency to format plan prices, and the admin app can read
  // the brand name for rendering.
  @UseGuards(JwtAuthGuard)
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  // PATCH is admin-only — regular users on the mobile app must not be able
  // to change the store currency or rebrand the admin panel.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch()
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
