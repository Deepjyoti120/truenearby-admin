import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryFileStorage } from '../photos/multer.config';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdateProfileSettingsDto } from './dto/update-profile-settings.dto';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  createProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateProfileDto,
  ) {
    return this.profileService.create(user.id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Post('fcm')
  registerDevice(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.profileService.registerDevice(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('photos')
  @UseInterceptors(
    FilesInterceptor('photos', 6, {
      storage: memoryFileStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['photos'],
    },
  })
  uploadProfilePhotos(
    @CurrentUser() user: { id: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.profileService.addPhotosFromFiles(user.id, files);
  }

  @UseGuards(JwtAuthGuard)
  @Post('photos/:photoId/delete')
  deletePhoto(
    @CurrentUser() user: { id: string },
    @Param('photoId', new ParseUUIDPipe()) photoId: string,
  ) {
    return this.profileService.softDeletePhoto(user.id, photoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@CurrentUser() user: { id: string }) {
    return this.profileService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateProfileSettings(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileSettingsDto,
  ) {
    return this.profileService.updateSettings(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts')
  getPosts(@CurrentUser() user: { id: string }, @Query() query: GetPostsDto) {
    return this.profileService.getPosts(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':blockedId/block')
  blockUser(
    @CurrentUser() user: { id: string },
    @Param('blockedId', new ParseUUIDPipe()) blockedId: string,
  ) {
    return this.profileService.userBlock(user.id, blockedId);
  }
}
