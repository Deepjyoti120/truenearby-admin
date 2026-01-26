import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ImageKitService } from './imagekit.service';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('Photos')
@ApiBearerAuth('access-token')
@Controller('photos')
export class PhotosController {
  constructor(
    private readonly imageKitService: ImageKitService,
    private readonly photosService: PhotosService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('upload-auth')
  getUploadAuth() {
    return this.imageKitService.getUploadAuth();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  savePhoto(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { url: string },
  ) {
    return this.photosService.save(user.id, body.url);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':photoId/primary')
  setPrimary(
    @CurrentUser() user: CurrentUserPayload,
    @Param('photoId') photoId: string,
  ) {
    return this.photosService.setPrimary(user.id, photoId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':photoId')
  deletePhoto(
    @CurrentUser() user: CurrentUserPayload,
    @Param('photoId') photoId: string,
  ) {
    return this.photosService.delete(user.id, photoId);
  }
}
