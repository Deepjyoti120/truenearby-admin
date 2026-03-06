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

  async create(userId: string, dto: CreatePostDto, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    if (files.length > this.MAX_IMAGES_PER_POST) {
      throw new BadRequestException('Maximum 10 images allowed per post');
    }

    const uploads = await Promise.all(
      files.map((file) => this.imageKitService.uploadFile(file)),
    );

    const post = await this.prisma.post.create({
      data: {
        userId,
        caption: dto.caption?.trim() ? dto.caption.trim() : null,
        imageUrls: uploads.map((upload) => upload.url),
        imageFileIds: uploads.map((upload) => upload.fileId),
      },
    });

    return {
      success: true,
      post,
    };
  }

  async delete(userId: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        userId,
        isDeleted: false,
      },
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

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }
}
