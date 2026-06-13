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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ImageKitService } from './imagekit.service';
import { PhotosService } from './photos.service';
import { ListPhotosDto, VerifyPhotosDto } from './dto/list-photos.dto';
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
  @Get('admin')
  listPhotos(@Query() query: ListPhotosDto) {
    return this.photosService.listPhotos(query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:photoId/verify')
  verifyPhoto(
    @Param('photoId') photoId: string,
    @Body() body: { isVerified: boolean },
  ) {
    return this.photosService.setVerified(photoId, body.isVerified);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/verify')
  verifyManyPhotos(@Body() body: VerifyPhotosDto) {
    return this.photosService.verifyMany(body.ids, body.isVerified ?? true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:photoId/active')
  setPhotoActive(
    @Param('photoId') photoId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.photosService.setActive(photoId, body.isActive);
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
