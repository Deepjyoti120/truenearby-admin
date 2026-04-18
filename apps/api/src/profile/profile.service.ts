import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { ImageKitService } from '../photos/imagekit.service';
import { ReverseGeocodeService } from '../common/geo/reverse-geocode.service';
import { ProfilePreferencesService } from './profile-preferences.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { Prisma } from '../generated/prisma/client';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

const FEED_POST_SELECT = {
  id: true,
  userId: true,
  prompt: true,
  imageUrls: true,
  imageFileIds: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      profile: true,
    },
  },
} satisfies Prisma.PostSelect;

const DEFAULT_POST_LIMIT = 10;

type FeedCursor = {
  postId: string;
  postCreatedAt: Date;
  distanceKm?: number;
};

type FeedOrderRow = {
  id: string;
  postCreatedAt: Date;
  distanceKm?: number | null;
};

const buildFeedVisibilityClause = (userId: string) => Prisma.sql`
  AND EXISTS (
    SELECT 1
    FROM "users" u
    WHERE u.id = lup."userId"
      AND u."isActive" = true
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "blocks" b
    WHERE b."blockerId" = ${userId}::uuid
      AND b."blockedId" = lup."userId"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "blocks" b
    WHERE b."blockerId" = lup."userId"
      AND b."blockedId" = ${userId}::uuid
  )
`;

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageKitService: ImageKitService,
    private readonly reverseGeocodeService: ReverseGeocodeService,
    private readonly profilePreferencesService: ProfilePreferencesService,
    private readonly subscriptionsService: SubscriptionsService,
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
    const result = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          userId,
          gender: dto.gender,
          name: dto.name,
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
          isVerified: true,
        },
        include: {
          matchPreference: true,
        },
      });
      // await tx.user.update({
      //   where: { id: userId },
      //   data: {
      //     isVerified: true,
      //   },
      // });
      return profile;
    });
    return {
      success: true,
      result,
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

  async getProfile(userId: string) {
    const [profile, activeSubscription] = await Promise.all([
      this.prisma.profile.findFirst({
        where: { userId },
        include: {
          matchPreference: true,
          user: {
            select: {
              id: true,
              isActive: true,
              photos: true,
            },
          },
        },
      }),
      this.subscriptionsService.getCurrentSubscriptionForUser(userId),
    ]);
    return {
      success: true,
      profile,
      activeSubscription,
    };
  }
  async getPosts(userId: string, query: GetPostsDto) {
    const cursor = this.parseFeedCursor(query.cursor);
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_POST_LIMIT;
    const skip = cursor ? 0 : (page - 1) * limit;
    const take = limit + 1;

    if (cursor && page > 1) {
      throw new BadRequestException(
        'cursor cannot be combined with page greater than 1',
      );
    }

    const referenceLocation = await this.resolvePostsReferenceLocation(
      userId,
      query,
    );

    if (!referenceLocation) {
      const [postOrderRows, total] = await Promise.all([
        this.fetchLatestPostsByRecency(userId, {
          cursor,
          skip,
          take,
        }),
        cursor ? Promise.resolve(undefined) : this.getLatestPostCount(userId),
      ]);

      return this.buildPostFeedResponse(postOrderRows, limit, {
        userId,
        page,
        total,
      });
    }

    const { latitude, longitude, radiusKm } = referenceLocation;
    const [postOrderRows, total] = await Promise.all([
      this.fetchNearestPosts(
        userId,
        { latitude, longitude },
        // { latitude, longitude, radiusKm },
        { skip, take },
      ),
      cursor ? Promise.resolve(undefined) : this.getLatestPostCount(userId),
    ]);

    return this.buildPostFeedResponse(postOrderRows, limit, {
      userId,
      page,
      total,
      radiusKm,
    });
  }

  private async resolvePostsReferenceLocation(
    userId: string,
    query: GetPostsDto,
  ) {
    const hasLatitude = query.latitude !== undefined;
    const hasLongitude = query.longitude !== undefined;

    if (hasLatitude !== hasLongitude) {
      throw new BadRequestException(
        'latitude and longitude must be provided together',
      );
    }

    if (hasLatitude && hasLongitude) {
      return {
        latitude: query.latitude!,
        longitude: query.longitude!,
        radiusKm: query.radiusKm ?? 20,
      };
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        latitude: true,
        longitude: true,
      },
    });

    if (!profile) {
      return null;
    }

    return {
      latitude: profile.latitude,
      longitude: profile.longitude,
      radiusKm: query.radiusKm ?? 20,
    };
  }

  private async buildPostFeedResponse(
    rows: FeedOrderRow[],
    limit: number,
    options: {
      userId: string;
      page: number;
      total?: number;
      radiusKm?: number;
    },
  ) {
    const hasMore = rows.length > limit;
    const visibleRows = hasMore ? rows.slice(0, limit) : rows;
    const posts = await this.findPostsByOrderedIds(
      options.userId,
      visibleRows.map((post) => post.id),
    );
    const lastRow = visibleRows.at(-1);

    return {
      success: true,
      pagination: {
        limit,
        ...(options.total !== undefined
          ? {
              total: options.total,
              page: options.page,
              totalPages: Math.ceil(options.total / limit),
            }
          : {}),
        ...(options.radiusKm !== undefined
          ? { radiusKm: options.radiusKm }
          : {}),
        hasMore,
        nextCursor:
          hasMore && lastRow ? this.serializeFeedCursor(lastRow) : null,
      },
      posts,
    };
  }

  private async fetchLatestPostsByRecency(
    userId: string,
    options: {
      cursor: FeedCursor | null;
      skip: number;
      take: number;
    },
  ) {
    const cursorClause = options.cursor
      ? Prisma.sql`
          AND (
            lup."postCreatedAt" < ${options.cursor.postCreatedAt}
            OR (
              lup."postCreatedAt" = ${options.cursor.postCreatedAt}
              AND lup."postId" < ${options.cursor.postId}::uuid
            )
          )
        `
      : Prisma.empty;

    return this.prisma.$queryRaw<Array<FeedOrderRow>>(Prisma.sql`
      SELECT
        lup."postId" AS id,
        lup."postCreatedAt"
      FROM "latest_user_posts" lup
      WHERE lup."userId" != ${userId}::uuid
      ${buildFeedVisibilityClause(userId)}
      AND NOT EXISTS (
        SELECT 1
        FROM "post_swipes" ps
        WHERE ps."postId" = lup."postId"
          AND ps."userId" = ${userId}::uuid
      )
      ${cursorClause}
      ORDER BY lup."postCreatedAt" DESC, lup."postId" DESC
      LIMIT ${options.take}
      OFFSET ${options.skip};
    `);
  }

  private async fetchNearestPosts(
    userId: string,
    referenceLocation: {
      latitude: number;
      longitude: number;
    },
    options: {
      skip: number;
      take: number;
    },
  ) {
    return this.prisma.$queryRaw<Array<FeedOrderRow>>(Prisma.sql`
    SELECT
      lup."postId" AS id,
      lup."postCreatedAt",
      (
        6371 * acos(
          LEAST(
            1,
            GREATEST(
              -1,
              cos(radians(${referenceLocation.latitude})) *
              cos(radians(lup.latitude)) *
              cos(radians(lup.longitude) - radians(${referenceLocation.longitude})) +
              sin(radians(${referenceLocation.latitude})) *
              sin(radians(lup.latitude))
            )
          )
        )
      ) AS "distanceKm"
    FROM "latest_user_posts" lup
    WHERE lup."userId" != ${userId}::uuid
      ${buildFeedVisibilityClause(userId)}
      AND NOT EXISTS (
        SELECT 1
        FROM "post_swipes" ps
        WHERE ps."postId" = lup."postId"
          AND ps."userId" = ${userId}::uuid
      )
    ORDER BY
      "distanceKm" ASC,
      lup."postCreatedAt" DESC,
      lup."postId" DESC
    LIMIT ${options.take}
    OFFSET ${options.skip};
  `);
  }

  private async fetchLatestPostsByDistance(
    userId: string,
    referenceLocation: {
      latitude: number;
      longitude: number;
      radiusKm: number;
    },
    options: {
      cursor: FeedCursor | null;
      skip: number;
      take: number;
    },
  ) {
    if (options.cursor && options.cursor.distanceKm === undefined) {
      throw new BadRequestException('Invalid posts cursor');
    }

    const distanceBucket =
      options.cursor && options.cursor.distanceKm! <= referenceLocation.radiusKm
        ? 0
        : 1;
    const cursorClause = options.cursor
      ? Prisma.sql`
          WHERE (
            CASE
              WHEN scored."distanceKm" <= ${referenceLocation.radiusKm} THEN 0
              ELSE 1
            END > ${distanceBucket}
            OR (
              CASE
                WHEN scored."distanceKm" <= ${referenceLocation.radiusKm}
                  THEN 0
                ELSE 1
              END = ${distanceBucket}
              AND (
                scored."distanceKm" > ${options.cursor.distanceKm!}
                OR (
                  scored."distanceKm" = ${options.cursor.distanceKm!}
                  AND (
                    scored."postCreatedAt" < ${options.cursor.postCreatedAt}
                    OR (
                      scored."postCreatedAt" =
                        ${options.cursor.postCreatedAt}
                      AND scored.id < ${options.cursor.postId}::uuid
                    )
                  )
                )
              )
            )
          )
        `
      : Prisma.empty;

    return this.prisma.$queryRaw<Array<FeedOrderRow>>(Prisma.sql`
      SELECT
        scored.id,
        scored."postCreatedAt",
        scored."distanceKm"
      FROM (
        SELECT
          lup."postId" AS id,
          lup."postCreatedAt",
          (
            6371 * acos(
              LEAST(
                1,
                GREATEST(
                  -1,
                  cos(radians(${referenceLocation.latitude})) *
                  cos(radians(lup.latitude)) *
                  cos(radians(lup.longitude) - radians(${referenceLocation.longitude})) +
                  sin(radians(${referenceLocation.latitude})) *
                  sin(radians(lup.latitude))
                )
              )
            )
          ) AS "distanceKm"
        FROM "latest_user_posts" lup
        WHERE lup."userId" != ${userId}::uuid
        ${buildFeedVisibilityClause(userId)}
        AND NOT EXISTS (
          SELECT 1
          FROM "post_swipes" ps
          WHERE ps."postId" = lup."postId"
            AND ps."userId" = ${userId}::uuid
        )
      ) AS scored
      ${cursorClause}
      ORDER BY
        CASE WHEN scored."distanceKm" <= ${referenceLocation.radiusKm} THEN 0 ELSE 1 END ASC,
        scored."distanceKm" ASC,
        scored."postCreatedAt" DESC,
        scored.id DESC
      LIMIT ${options.take}
      OFFSET ${options.skip};
    `);
  }

  private parseFeedCursor(cursor?: string): FeedCursor | null {
    if (!cursor) {
      return null;
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as {
        postId?: unknown;
        postCreatedAt?: unknown;
        distanceKm?: unknown;
      };

      if (
        typeof decoded.postId !== 'string' ||
        typeof decoded.postCreatedAt !== 'string' ||
        (decoded.distanceKm !== undefined &&
          typeof decoded.distanceKm !== 'number')
      ) {
        throw new Error('Invalid cursor payload');
      }

      const postCreatedAt = new Date(decoded.postCreatedAt);

      if (Number.isNaN(postCreatedAt.getTime())) {
        throw new Error('Invalid cursor date');
      }

      return {
        postId: decoded.postId,
        postCreatedAt,
        distanceKm: decoded.distanceKm,
      };
    } catch {
      throw new BadRequestException('Invalid posts cursor');
    }
  }

  private serializeFeedCursor(row: FeedOrderRow) {
    return Buffer.from(
      JSON.stringify({
        postId: row.id,
        postCreatedAt: row.postCreatedAt.toISOString(),
        ...(row.distanceKm !== undefined && row.distanceKm !== null
          ? { distanceKm: row.distanceKm }
          : {}),
      }),
      'utf8',
    ).toString('base64url');
  }

  private async getLatestPostCount(userId: string) {
    const [result] = await this.prisma.$queryRaw<Array<{ total: number }>>(
      Prisma.sql`
        SELECT COUNT(*)::int AS total
        FROM "latest_user_posts" lup
        WHERE lup."userId" != ${userId}::uuid
        ${buildFeedVisibilityClause(userId)}
        AND NOT EXISTS (
          SELECT 1
          FROM "post_swipes" ps
          WHERE ps."postId" = lup."postId"
            AND ps."userId" = ${userId}::uuid
        );
      `,
    );

    return result?.total ?? 0;
  }

  private async findPostsByOrderedIds(userId: string, postIds: string[]) {
    if (postIds.length === 0) {
      return [];
    }

    const posts = await this.prisma.post.findMany({
      where: {
        id: {
          in: postIds,
        },
      },
      select: FEED_POST_SELECT,
    });
    const ownerIds = [...new Set(posts.map((post) => post.userId))];
    const activeSubscriptionPromise =
      this.subscriptionsService.getCurrentSubscriptionForUser(userId);
    const [matches, likesReceived, activeSubscription] =
      ownerIds.length === 0
        ? [[], [], await activeSubscriptionPromise]
        : await Promise.all([
            this.prisma.match.findMany({
              where: {
                OR: [
                  {
                    userAId: userId,
                    userBId: {
                      in: ownerIds,
                    },
                  },
                  {
                    userBId: userId,
                    userAId: {
                      in: ownerIds,
                    },
                  },
                ],
              },
              select: {
                userAId: true,
                userBId: true,
              },
            }),
            this.prisma.like.findMany({
              where: {
                toUserId: userId,
                fromUserId: {
                  in: ownerIds,
                },
              },
              select: {
                fromUserId: true,
              },
            }),
            activeSubscriptionPromise,
          ]);
    const postsById = new Map(posts.map((post) => [post.id, post]));
    const matchedUserIds = new Set(
      matches.map((match) =>
        match.userAId === userId ? match.userBId : match.userAId,
      ),
    );
    const likedYouUserIds = new Set(
      likesReceived.map((like) => like.fromUserId),
    );
    const canSeeLikedYouInAdvancedHome =
      activeSubscription?.features.showLikesInAdvancedHome ?? false;

    return postIds
      .map((id) => {
        const post = postsById.get(id);

        if (!post) {
          return null;
        }

        const isMatch = matchedUserIds.has(post.userId);
        const likedYou = !isMatch && likedYouUserIds.has(post.userId);
        const isConnected = isMatch && likedYouUserIds.has(post.userId);

        return {
          ...post,
          isMatch,
          likedYou: canSeeLikedYouInAdvancedHome && likedYou,
          likedYouLocked: !canSeeLikedYouInAdvancedHome && likedYou,
          isConnected,
        };
      })
      .filter((post): post is NonNullable<typeof post> => Boolean(post));
  }

  // async userBlock(userId: string, blockedId: string) {
  //   await this.prisma.$transaction(async (tx) => {
  //     await tx.block.create({
  //       data: {
  //         blockerId: userId,
  //         blockedId: blockedId,
  //       },
  //     });
  //   });
  //   return {
  //     success: true,
  //   };
  // }
  async userBlock(userId: string, blockedId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.block.upsert({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId: blockedId,
          },
        },
        update: {},
        create: {
          blockerId: userId,
          blockedId: blockedId,
        },
      });
    });
    return {
      success: true,
    };
  }
}
