import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../photos/imagekit.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  private readonly MAX_IMAGES_PER_POST = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageKitService: ImageKitService,
  ) {}

  async create(
    userId: string,
    dto: CreatePostDto,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    if (files.length > this.MAX_IMAGES_PER_POST) {
      throw new BadRequestException('Maximum 10 images allowed per post');
    }

    const uploads = await Promise.all(
      files.map((file) => this.imageKitService.uploadFile(file)),
    );

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { latitude: true, longitude: true },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    const prompt = dto.prompt?.trim() || dto.caption?.trim() || null;
    const latitude = dto.latitude ?? profile.latitude;
    const longitude = dto.lng ?? profile.longitude;

    const post = await this.prisma.post.create({
      data: {
        userId,
        prompt,
        imageUrls: uploads.map((upload) => upload.url),
        imageFileIds: uploads.map((upload) => upload.fileId),
        latitude,
        longitude,
      },
    });

    return {
      success: true,
      post,
    };
  }

  async delete(userId: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    if (post.imageFileIds.length > 0) {
      await Promise.allSettled(
        post.imageFileIds.map((fileId) =>
          this.imageKitService.deleteFileById(fileId),
        ),
      );
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { success: true };
  }
}
