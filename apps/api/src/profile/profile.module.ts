import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ImageKitService } from '../photos/imagekit.service';
import { GeoModule } from '../common/geo/geo.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ImageKitService],
  imports: [GeoModule],
})
export class ProfileModule {}
