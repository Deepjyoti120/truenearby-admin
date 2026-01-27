import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from './imagekit.service';

@Injectable()
export class PhotosService {
  private readonly MAX_PHOTOS = 6;

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageKitService: ImageKitService,
  ) {}

  async save(userId: string, url: string, fileId: string) {
    const count = await this.prisma.photo.count({
      where: { userId },
    });

    if (count >= this.MAX_PHOTOS) {
      throw new BadRequestException('Maximum 6 photos allowed');
    }
    const isPrimary = count === 0;
    const photo = await this.prisma.photo.create({
      data: {
        userId,
        url,
        isPrimary,
        fileId,
      },
    });
    return {
      success: true,
      photo,
    };
  }
  async setPrimary(userId: string, photoId: string) {
    const photo = await this.prisma.photo.findFirst({
      where: {
        id: photoId,
        userId,
      },
    });

    if (!photo) {
      throw new BadRequestException('Photo not found');
    }

    await this.prisma.$transaction([
      this.prisma.photo.updateMany({
        where: { userId },
        data: { isPrimary: false },
      }),
      this.prisma.photo.update({
        where: { id: photoId },
        data: { isPrimary: true },
      }),
    ]);

    return { success: true };
  }
  async delete(userId: string, photoId: string) {
    const photos = await this.prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (photos.length <= 1) {
      throw new BadRequestException('At least one photo required');
    }

    const target = photos.find((p) => p.id === photoId);
    if (!target) {
      throw new BadRequestException('Photo not found');
    }

    // await this.imageKitService.delete(file);
    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    if (target.isPrimary) {
      const next = photos.find((p) => p.id !== photoId);
      if (next) {
        await this.prisma.photo.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    return { success: true };
  }
  async uploadToImageKit(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const count = await this.prisma.photo.count({ where: { userId } });
    if (count >= 6) throw new BadRequestException('Max 6 photos allowed');

    const { url, fileId } = await this.imageKitService.uploadFile(file);
    const isPrimary = count === 0;

    const photo = await this.prisma.photo.create({
      data: {
        userId,
        url,
        fileId,
        isPrimary,
      },
    });

    return { success: true, photo };
  }
}
