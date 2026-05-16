import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController],
  providers: [SettingsService, RolesGuard],
  exports: [SettingsService],
})
export class SettingsModule {}
