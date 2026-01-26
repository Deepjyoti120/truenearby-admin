import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';

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
      },
    });

    return {
      success: true,
      profile,
    };
  }
}
