import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../photos/imagekit.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { SwipePostDto } from './dto/swipe-post.dto';
import { Prisma } from '../generated/prisma/client';
import { SwipeType } from '../generated/prisma/enums';
import { randomUUID } from 'crypto';

type LatestPostSnapshot = {
  id: string;
  createdAt: Date;
  latitude: number;
  longitude: number;
};

@Injectable()
export class PostsService {
  private readonly MAX_IMAGES_PER_POST = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageKitService: ImageKitService,
  ) { }

  async listForAdmin(dto: ListPostsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const search = dto.search?.trim();
    const verified = dto.verified ?? 'unverified';

    const where: Prisma.PostWhereInput = {};
    if (search) {
      where.user = {
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
      };
    }

    if (verified === 'verified') {
      where.isVerified = true;
    } else if (verified === 'unverified') {
      where.isVerified = false;
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          prompt: true,
          imageUrls: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              email: true,
              isActive: true,
              profile: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items.map((p) => ({
        id: p.id,
        prompt: p.prompt,
        imageUrls: p.imageUrls,
        isVerified: p.isVerified,
        isActive: p.isActive,
        createdAt: p.createdAt,
        userId: p.userId,
        ownerEmail: p.user?.email ?? null,
        ownerName: p.user?.profile?.name ?? null,
        ownerIsActive: p.user?.isActive ?? true,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async setVerified(postId: string, isVerified: boolean) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.prisma.post.update({
      where: { id: postId },
      data: { isVerified },
    });
    return { id: postId, isVerified };
  }

  async verifyMany(ids: string[], isVerified: boolean) {
    if (!ids?.length) {
      throw new BadRequestException('No posts selected');
    }
    const result = await this.prisma.post.updateMany({
      where: { id: { in: ids } },
      data: { isVerified },
    });
    return { count: result.count, isVerified };
  }

  async setActive(postId: string, isActive: boolean) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.prisma.post.update({
      where: { id: postId },
      data: { isActive },
    });
    return { id: postId, isActive };
  }

  async findAllByUser(userId: string, query: GetPostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where: { userId, isActive: true, isVerified: true },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.post.count({
        where: { userId },
      }),
    ]);

    return {
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      posts,
    };
  }

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

    const prompt = dto.prompt?.trim() || null;
    const latitude = dto.latitude ?? profile.latitude;
    const longitude = dto.longitude ?? profile.longitude;

    const post = await this.prisma.$transaction(async (tx) => {
      const createdPost = await tx.post.create({
        data: {
          userId,
          prompt,
          imageUrls: uploads.map((upload) => upload.url),
          imageFileIds: uploads.map((upload) => upload.fileId),
          latitude,
          longitude,
        },
      });

      await this.upsertLatestUserPost(tx, userId, {
        id: createdPost.id,
        createdAt: createdPost.createdAt,
        latitude: createdPost.latitude,
        longitude: createdPost.longitude,
      });

      return createdPost;
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

    await this.prisma.$transaction(async (tx) => {
      await tx.post.delete({
        where: { id: postId },
      });

      await this.refreshLatestUserPost(tx, userId);
    });

    return { success: true };
  }

  async swipePost(userId: string, dto: SwipePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: dto.postId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId === userId) {
      throw new BadRequestException('Cannot swipe your own post');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const [swipe] = await tx.$queryRaw<
        Array<{
          id: string;
          userId: string;
          postId: string;
          type: SwipeType;
          createdAt: Date;
        }>
      >(Prisma.sql`
        INSERT INTO "post_swipes" ("id", "userId", "postId", "type", "createdAt")
        VALUES (
          ${randomUUID()}::uuid,
          ${userId}::uuid,
          ${dto.postId}::uuid,
          CAST(${dto.type} AS "SwipeType"),
          CURRENT_TIMESTAMP
        )
        ON CONFLICT ("userId", "postId")
        DO UPDATE SET "type" = EXCLUDED."type"
        RETURNING "id", "userId", "postId", "type", "createdAt";
      `);

      if (dto.type !== SwipeType.LIKE) {
        await tx.like.deleteMany({
          where: {
            fromUserId: userId,
            toUserId: post.userId,
          },
        });

        return { swipe, match: null };
      }

      await tx.like.upsert({
        where: {
          fromUserId_toUserId: {
            fromUserId: userId,
            toUserId: post.userId,
          },
        },
        update: {},
        create: {
          fromUserId: userId,
          toUserId: post.userId,
        },
      });

      const reverseLike = await tx.like.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: post.userId,
            toUserId: userId,
          },
        },
        select: { id: true },
      });

      if (!reverseLike) {
        return { swipe, match: null };
      }

      const [userAId, userBId] =
        userId < post.userId ? [userId, post.userId] : [post.userId, userId];

      const match = await tx.match.upsert({
        where: {
          userAId_userBId: {
            userAId,
            userBId,
          },
        },
        update: {},
        create: {
          userAId,
          userBId,
          chat: {
            create: {},
          },
        },
        include: {
          chat: true,
        },
      });

      return { swipe, match };
    });

    return {
      success: true,
      ...result,
    };
  }

  private async upsertLatestUserPost(
    tx: Prisma.TransactionClient,
    userId: string,
    post: LatestPostSnapshot,
  ) {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "latest_user_posts" (
        "userId",
        "postId",
        "postCreatedAt",
        "latitude",
        "longitude"
      )
      VALUES (
        ${userId}::uuid,
        ${post.id}::uuid,
        ${post.createdAt},
        ${post.latitude},
        ${post.longitude}
      )
      ON CONFLICT ("userId")
      DO UPDATE SET
        "postId" = EXCLUDED."postId",
        "postCreatedAt" = EXCLUDED."postCreatedAt",
        "latitude" = EXCLUDED."latitude",
        "longitude" = EXCLUDED."longitude";
    `);
  }

  private async refreshLatestUserPost(
    tx: Prisma.TransactionClient,
    userId: string,
  ) {
    const [latestRemainingPost] = await tx.$queryRaw<Array<LatestPostSnapshot>>(
      Prisma.sql`
        SELECT
          p.id,
          p."createdAt",
          p.latitude,
          p.longitude
        FROM "posts" p
        WHERE p."userId" = ${userId}::uuid
        ORDER BY p."createdAt" DESC, p.id DESC
        LIMIT 1;
      `,
    );

    if (!latestRemainingPost) {
      await tx.$executeRaw(Prisma.sql`
        DELETE FROM "latest_user_posts"
        WHERE "userId" = ${userId}::uuid;
      `);
      return;
    }

    await this.upsertLatestUserPost(tx, userId, latestRemainingPost);
  }
}
