import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from './imagekit.service';
import { ListPhotosDto } from './dto/list-photos.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class PhotosService {
  private readonly MAX_PHOTOS = 6;

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageKitService: ImageKitService,
  ) {}

  async listPhotos(dto: ListPhotosDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const search = dto.search?.trim();

    const where: Prisma.PhotoWhereInput = search
      ? {
          user: {
            is: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                {
                  profile: {
                    is: { name: { contains: search, mode: 'insensitive' } },
                  },
                },
              ],
            },
          },
        }
      : {};

    const [total, items] = await this.prisma.$transaction([
      this.prisma.photo.count({ where }),
      this.prisma.photo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          url: true,
          isPrimary: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              email: true,
              profile: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items.map((p) => ({
        id: p.id,
        url: p.url,
        isPrimary: p.isPrimary,
        createdAt: p.createdAt,
        userId: p.userId,
        ownerEmail: p.user?.email ?? null,
        ownerName: p.user?.profile?.name ?? null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

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
        // isDeleted: false,
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

    await this.prisma.photo.update({
      where: { id: photoId },
      data: {
        isPrimary: false,
      },
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

    const count = await this.prisma.photo.count({
      where: { userId },
    });
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
