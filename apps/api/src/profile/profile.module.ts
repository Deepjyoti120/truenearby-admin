import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ImageKitService } from '../photos/imagekit.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ImageKitService],
})
export class ProfileModule {}
