import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { ImageKitService } from '../photos/imagekit.service';
import { ReverseGeocodeService } from '../common/geo/reverse-geocode.service';
import { ProfilePreferencesService } from './profile-preferences.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { Prisma } from '../generated/prisma/client';

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
    const result = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
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
      await tx.user.update({
        where: { id: userId },
        data: {
          isRegistered: true,
          isVerified: true,
        },
      });
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
    const profile = await this.prisma.profile.findFirst({
      where: { userId },
      include: {
        matchPreference: true,
        user: {
          select: {
            photos: true,
          },
        },
      },
    });
    return {
      success: true,
      profile,
    };
  }
  async getPosts(userId: string, query: GetPostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const referenceLocation = await this.resolvePostsReferenceLocation(
      userId,
      query,
    );

    if (!referenceLocation) {
      const [postOrderRows, total] = await Promise.all([
        this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
          SELECT ranked.id
          FROM (
            SELECT
              p.id,
              p."userId",
              p."createdAt",
              ROW_NUMBER() OVER (
                PARTITION BY p."userId"
                ORDER BY p."createdAt" DESC
              ) AS row_num
            FROM posts p
          ) AS ranked
          WHERE ranked.row_num = 1
          ORDER BY ranked."createdAt" DESC
          LIMIT ${limit}
          OFFSET ${skip};
        `),
        this.getUniquePostCount(),
      ]);
      const posts = await this.findPostsByOrderedIds(
        postOrderRows.map((post) => post.id),
      );

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

    const { latitude, longitude, radiusKm } = referenceLocation;
    const [postOrderRows, total] = await Promise.all([
      this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT ranked.id
        FROM (
          SELECT
            scored.id,
            scored."userId",
            scored."createdAt",
            scored.distance,
            ROW_NUMBER() OVER (
              PARTITION BY scored."userId"
              ORDER BY scored.distance ASC, scored."createdAt" DESC
            ) AS row_num
          FROM (
            SELECT
              p.id,
              p."userId",
              p."createdAt",
              (
                6371 * acos(
                  LEAST(
                    1,
                    GREATEST(
                      -1,
                      cos(radians(${latitude})) * cos(radians(p.latitude)) *
                      cos(radians(p.longitude) - radians(${longitude})) +
                      sin(radians(${latitude})) * sin(radians(p.latitude))
                    )
                  )
                )
              ) AS distance
            FROM posts p
          ) AS scored
        ) AS ranked
        WHERE ranked.row_num = 1
        ORDER BY
          CASE WHEN ranked.distance <= ${radiusKm} THEN 0 ELSE 1 END ASC,
          ranked.distance ASC,
          ranked."createdAt" DESC
        LIMIT ${limit}
        OFFSET ${skip};
      `),
      this.getUniquePostCount(),
    ]);

    const orderedPosts = await this.findPostsByOrderedIds(
      postOrderRows.map((post) => post.id),
    );

    return {
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        radiusKm,
      },
      posts: orderedPosts,
    };
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

  private async getUniquePostCount() {
    const [result] = await this.prisma.$queryRaw<Array<{ total: number }>>(
      Prisma.sql`
        SELECT COUNT(DISTINCT p."userId")::int AS total
        FROM posts p;
      `,
    );

    return result?.total ?? 0;
  }

  private async findPostsByOrderedIds(postIds: string[]) {
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
    const postsById = new Map(posts.map((post) => [post.id, post]));

    return postIds
      .map((id) => postsById.get(id))
      .filter((post): post is NonNullable<typeof post> => Boolean(post));
  }
}
