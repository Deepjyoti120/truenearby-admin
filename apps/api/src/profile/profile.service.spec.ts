import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../photos/imagekit.service';
import { ReverseGeocodeService } from '../common/geo/reverse-geocode.service';
import { Gender, LookingFor } from '../generated/prisma/enums';
import { ProfilePreferencesService } from './profile-preferences.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: {
    profile: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    photo: {
      count: jest.Mock;
      createMany: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    userDevice: {
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
    post: {
      findMany: jest.Mock;
    };
    user: {
      update: jest.Mock;
    };
    $queryRaw: jest.Mock;
    $transaction: jest.Mock;
  };
  let reverseGeocodeService: {
    getCityAndCountry: jest.Mock;
  };
  let profilePreferencesService: {
    normalizeInterests: jest.Mock;
    resolvePreferredAgeRange: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            photo: {
              count: jest.fn(),
              createMany: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            userDevice: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            post: {
              findMany: jest.fn(),
            },
            user: {
              update: jest.fn(),
            },
            $queryRaw: jest.fn(),
            $transaction: jest.fn(),
          },
        },
        {
          provide: ImageKitService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
        {
          provide: ReverseGeocodeService,
          useValue: {
            getCityAndCountry: jest.fn(),
          },
        },
        {
          provide: ProfilePreferencesService,
          useValue: {
            normalizeInterests: jest.fn(),
            resolvePreferredAgeRange: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get(PrismaService);
    reverseGeocodeService = module.get(ReverseGeocodeService);
    profilePreferencesService = module.get(ProfilePreferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('stores normalized interests and match preference range', async () => {
      const tx = {
        profile: {
          create: jest.fn(),
        },
        user: {
          update: jest.fn(),
        },
      };

      prisma.profile.findUnique.mockResolvedValue(null);
      reverseGeocodeService.getCityAndCountry.mockResolvedValue({
        city: 'Delhi',
        country: 'India',
      });
      profilePreferencesService.normalizeInterests.mockReturnValue([
        'travel',
        'coffee',
      ]);
      profilePreferencesService.resolvePreferredAgeRange.mockReturnValue({
        minAge: 24,
        maxAge: 32,
      });

      const createdProfile = {
        id: 'profile-1',
        userId: 'user-1',
        interests: ['travel', 'coffee'],
        matchPreference: {
          minAge: 24,
          maxAge: 32,
        },
      };
      tx.profile.create.mockResolvedValue(createdProfile);
      tx.user.update.mockResolvedValue({
        id: 'user-1',
      });
      prisma.$transaction.mockImplementation(async (callback) => callback(tx));

      const result = await service.create('user-1', {
        gender: Gender.MALE,
        lookingFor: LookingFor.LONG_TERM_RELATIONSHIP,
        birthDate: '1998-05-20',
        bio: 'Love travelling and coffee',
        interests: [' Travel ', 'Coffee', 'travel'],
        preferredMinAge: 24,
        preferredMaxAge: 32,
        latitude: 28.6139,
        longitude: 77.209,
      });

      expect(profilePreferencesService.normalizeInterests).toHaveBeenCalledWith(
        [' Travel ', 'Coffee', 'travel'],
      );
      expect(
        profilePreferencesService.resolvePreferredAgeRange,
      ).toHaveBeenCalledWith(24, 32);
      expect(tx.profile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          interests: ['travel', 'coffee'],
          city: 'Delhi',
          country: 'India',
          matchPreference: {
            create: {
              minAge: 24,
              maxAge: 32,
            },
          },
        }),
        include: {
          matchPreference: true,
        },
      });
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isRegistered: true,
          isVerified: true,
        },
      });
      expect(result).toEqual({
        success: true,
        result: createdProfile,
      });
    });

    it('rejects an inverted preferred age range', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);
      profilePreferencesService.resolvePreferredAgeRange.mockImplementation(
        () => {
          throw new BadRequestException(
            'preferredMinAge must be less than or equal to preferredMaxAge',
          );
        },
      );

      await expect(
        service.create('user-1', {
          gender: Gender.MALE,
          lookingFor: LookingFor.LONG_TERM_RELATIONSHIP,
          birthDate: '1998-05-20',
          preferredMinAge: 35,
          preferredMaxAge: 30,
          latitude: 28.6139,
          longitude: 77.209,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(profilePreferencesService.normalizeInterests).toHaveBeenCalledWith(
        undefined,
      );
      expect(
        profilePreferencesService.resolvePreferredAgeRange,
      ).toHaveBeenCalledWith(35, 30);
      expect(reverseGeocodeService.getCityAndCountry).not.toHaveBeenCalled();
      expect(prisma.profile.create).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('returns the current user profile with match preference and user photos', async () => {
      const profileRecord = {
        id: 'profile-1',
        userId: 'user-1',
        gender: Gender.MALE,
        lookingFor: LookingFor.LONG_TERM_RELATIONSHIP,
        birthDate: new Date('1998-05-20'),
        bio: 'Hello',
        interests: ['travel'],
        latitude: 28.6139,
        longitude: 77.209,
        city: 'Delhi',
        country: 'India',
        isHidden: false,
        isRegistered: true,
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        updatedAt: new Date('2026-03-15T00:00:00.000Z'),
        matchPreference: {
          minAge: 24,
          maxAge: 32,
        },
        user: {
          id: 'user-1',
          email: 'user@test.com',
          phone: null,
          isVerified: true,
          createdAt: new Date('2026-03-15T00:00:00.000Z'),
        },
      };
      prisma.profile.findFirst.mockResolvedValue(profileRecord);

      const result = await service.getProfile('user-1');

      expect(prisma.profile.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          matchPreference: true,
          user: {
            select: {
              photos: true,
            },
          },
        },
      });
      expect(result).toEqual({
        success: true,
        profile: profileRecord,
      });
    });
  });

  describe('getPosts', () => {
    it('reads the default feed from latest_user_posts and excludes swiped posts', async () => {
      const postRecord = {
        id: 'post-2',
        userId: 'user-2',
        prompt: 'Hello',
        imageUrls: ['https://example.com/post-2.jpg'],
        imageFileIds: ['file-2'],
        latitude: 28.61,
        longitude: 77.2,
        createdAt: new Date('2026-03-20T00:00:00.000Z'),
        updatedAt: new Date('2026-03-20T00:00:00.000Z'),
        user: {
          id: 'user-2',
          profile: {
            id: 'profile-2',
          },
        },
      };

      prisma.profile.findUnique.mockResolvedValue(null);
      prisma.$queryRaw
        .mockResolvedValueOnce([
          {
            id: 'post-2',
            postCreatedAt: new Date('2026-03-20T00:00:00.000Z'),
          },
        ])
        .mockResolvedValueOnce([{ total: 1 }]);
      prisma.post.findMany.mockResolvedValue([postRecord]);

      const result = await service.getPosts('user-1', {
        page: 1,
        limit: 10,
      });

      const [feedSql] = prisma.$queryRaw.mock.calls[0];
      const [countSql] = prisma.$queryRaw.mock.calls[1];

      expect(feedSql.sql).toContain('"latest_user_posts"');
      expect(feedSql.sql).toContain('"post_swipes"');
      expect(feedSql.sql).toContain('ORDER BY lup."postCreatedAt" DESC');
      expect(feedSql.values).toContain('user-1');
      expect(countSql.sql).toContain('COUNT(*)::int AS total');
      expect(countSql.sql).toContain('"latest_user_posts"');
      expect(countSql.sql).toContain('WHERE lup."userId" !=');
      expect(countSql.sql).toContain('"post_swipes"');
      expect(countSql.values).toContain('user-1');
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['post-2'],
          },
        },
        select: expect.any(Object),
      });
      expect(result).toEqual({
        success: true,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasMore: false,
          nextCursor: null,
        },
        posts: [postRecord],
      });
    });

    it('reads the distance-ranked feed from latest_user_posts and excludes swiped posts', async () => {
      const postRecord = {
        id: 'post-3',
        userId: 'user-3',
        prompt: 'Nearby',
        imageUrls: ['https://example.com/post-3.jpg'],
        imageFileIds: ['file-3'],
        latitude: 26.14,
        longitude: 91.73,
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        updatedAt: new Date('2026-03-21T00:00:00.000Z'),
        user: {
          id: 'user-3',
          profile: {
            id: 'profile-3',
          },
        },
      };

      prisma.$queryRaw
        .mockResolvedValueOnce([
          {
            id: 'post-3',
            postCreatedAt: new Date('2026-03-21T00:00:00.000Z'),
            distanceKm: 3.2,
          },
        ])
        .mockResolvedValueOnce([{ total: 1 }]);
      prisma.post.findMany.mockResolvedValue([postRecord]);

      const result = await service.getPosts('user-1', {
        page: 1,
        limit: 10,
        latitude: 26.1445,
        longitude: 91.7362,
        radiusKm: 25,
      });

      const [feedSql] = prisma.$queryRaw.mock.calls[0];

      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
      expect(feedSql.sql).toContain('distance');
      expect(feedSql.sql).toContain('"latest_user_posts"');
      expect(feedSql.sql).toContain('"post_swipes"');
      expect(feedSql.values).toContain('user-1');
      expect(result).toEqual({
        success: true,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          radiusKm: 25,
          hasMore: false,
          nextCursor: null,
        },
        posts: [postRecord],
      });
    });

    it('returns an opaque nextCursor without running an exact count in cursor mode', async () => {
      const firstPost = {
        id: 'post-4',
        userId: 'user-4',
        prompt: 'First',
        imageUrls: ['https://example.com/post-4.jpg'],
        imageFileIds: ['file-4'],
        latitude: 28.61,
        longitude: 77.2,
        createdAt: new Date('2026-03-22T00:00:00.000Z'),
        updatedAt: new Date('2026-03-22T00:00:00.000Z'),
        user: {
          id: 'user-4',
          profile: {
            id: 'profile-4',
          },
        },
      };
      const cursor = Buffer.from(
        JSON.stringify({
          postId: 'post-3',
          postCreatedAt: '2026-03-21T00:00:00.000Z',
        }),
        'utf8',
      ).toString('base64url');

      prisma.profile.findUnique.mockResolvedValue(null);
      prisma.$queryRaw.mockResolvedValueOnce([
        {
          id: 'post-4',
          postCreatedAt: new Date('2026-03-22T00:00:00.000Z'),
        },
        {
          id: 'post-5',
          postCreatedAt: new Date('2026-03-20T00:00:00.000Z'),
        },
      ]);
      prisma.post.findMany.mockResolvedValue([firstPost]);

      const result = await service.getPosts('user-1', {
        limit: 1,
        cursor,
      });

      const [feedSql] = prisma.$queryRaw.mock.calls[0];

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(feedSql.sql).toContain('"latest_user_posts"');
      expect(result).toEqual({
        success: true,
        pagination: {
          limit: 1,
          hasMore: true,
          nextCursor: expect.any(String),
        },
        posts: [firstPost],
      });
    });
  });
});
