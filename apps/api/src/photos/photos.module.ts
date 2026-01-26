import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageKitService } from './imagekit.service';

@Module({
  controllers: [PhotosController],
  providers: [PhotosService, ImageKitService],
  imports: [PrismaModule],
})
export class PhotosModule {}
