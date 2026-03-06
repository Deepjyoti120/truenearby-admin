import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('Profile already exists');
    }
    const profile = await this.prisma.profile.create({
      data: {
        userId,
        gender: dto.gender,
        lookingFor: dto.lookingFor,
        birthDate: new Date(dto.birthDate),
        heightCm: dto.heightCm,
        bio: dto.bio,
        latitude: dto.latitude,
        longitude: dto.longitude,
        city: dto.city,
        country: dto.country,
        isRegistered: true,
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
}
