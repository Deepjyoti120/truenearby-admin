import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ImageKitService } from './imagekit.service';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryFileStorage } from './multer.config';

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
    return this.photosService.save(user.id, body.url, 'hi');
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
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryFileStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadPhoto(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.photosService.uploadToImageKit(user.id, file);
  }
}
