import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { ImageKitService } from '../photos/imagekit.service';
import { ReverseGeocodeService } from '../common/geo/reverse-geocode.service';
import { ProfilePreferencesService } from './profile-preferences.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageKitService: ImageKitService,
    private readonly reverseGeocodeService: ReverseGeocodeService,
    private readonly profilePreferencesService: ProfilePreferencesService,
  ) {}

  async create(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('Profile already exists');
    }
    const interests = this.profilePreferencesService.normalizeInterests(
      dto.interests,
    );
    const preferenceAgeRange =
      this.profilePreferencesService.resolvePreferredAgeRange(
        dto.preferredMinAge,
        dto.preferredMaxAge,
      );
    const geocodeResult = await this.reverseGeocodeService.getCityAndCountry(
      dto.latitude,
      dto.longitude,
    );

    const profile = await this.prisma.profile.create({
      data: {
        userId,
        gender: dto.gender,
        lookingFor: dto.lookingFor,
        birthDate: new Date(dto.birthDate),
        heightCm: dto.heightCm,
        bio: dto.bio,
        interests,
        latitude: dto.latitude,
        longitude: dto.longitude,
        city: geocodeResult.city,
        country: geocodeResult.country,
        matchPreference: {
          create: preferenceAgeRange,
        },
        isRegistered: true,
      },
      include: {
        matchPreference: true,
      },
    });
    return {
      success: true,
      profile,
    };
  }
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const { fcmToken, platform } = dto;
    const existing = await this.prisma.userDevice.findUnique({
      where: { fcmToken },
    });
    if (existing) {
      await this.prisma.userDevice.update({
        where: { fcmToken },
        data: {
          userId,
          platform,
          isActive: true,
        },
      });
      return { success: true, message: 'Device updated' };
    }
    await this.prisma.userDevice.create({
      data: {
        userId,
        fcmToken,
        platform,
        isActive: true,
      },
    });
    return { success: true, message: 'Device registered' };
  }

  async addPhotosFromFiles(userId: string, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one photo is required');
    }

    const activeCount = await this.prisma.photo.count({
      where: { userId },
    });
    if (activeCount + files.length > 2) {
      throw new BadRequestException('Maximum 6 photos allowed');
    }
    const uploads = await Promise.all(
      files.map((file) => this.imageKitService.uploadFile(file)),
    );
    const shouldSetPrimary = activeCount === 0;
    const photosToCreate = uploads.map((upload, index) => ({
      userId,
      url: upload.url,
      fileId: upload.fileId,
      isPrimary: shouldSetPrimary ? index === 0 : false,
    }));
    await this.prisma.photo.createMany({ data: photosToCreate });
    const photos = await this.prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return {
      success: true,
      photos,
    };
  }

  async softDeletePhoto(userId: string, photoId: string) {
    const activePhotos = await this.prisma.photo.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'asc' },
    });
    const targetPhoto = activePhotos.find((photo) => photo.id === photoId);
    if (!targetPhoto) {
      throw new BadRequestException('Photo not found');
    }
    if (activePhotos.length <= 1) {
      throw new BadRequestException('At least one active photo is required');
    }
    const fallbackPrimary = activePhotos.find((photo) => photo.id !== photoId);
    await this.prisma.$transaction(async (tx) => {
      await tx.photo.update({
        where: { id: photoId },
        data: {
          isPrimary: false,
        },
      });
      if (targetPhoto.isPrimary && fallbackPrimary) {
        await tx.photo.update({
          where: { id: fallbackPrimary.id },
          data: { isPrimary: true },
        });
      }
    });
    const photos = await this.prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return {
      success: true,
      photos,
    };
  }
}
