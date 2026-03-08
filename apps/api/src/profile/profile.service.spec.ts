import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../photos/imagekit.service';
import { ReverseGeocodeService } from '../common/geo/reverse-geocode.service';
import { Gender, LookingFor } from '../generated/prisma/enums';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: {
    profile: {
      findUnique: jest.Mock;
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
    $transaction: jest.Mock;
  };
  let reverseGeocodeService: {
    getCityAndCountry: jest.Mock;
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
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get(PrismaService);
    reverseGeocodeService = module.get(ReverseGeocodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('stores normalized interests and match preference range', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);
      reverseGeocodeService.getCityAndCountry.mockResolvedValue({
        city: 'Delhi',
        country: 'India',
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
      prisma.profile.create.mockResolvedValue(createdProfile);

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

      expect(prisma.profile.create).toHaveBeenCalledWith({
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
      expect(result).toEqual({
        success: true,
        profile: createdProfile,
      });
    });

    it('rejects an inverted preferred age range', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

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

      expect(reverseGeocodeService.getCityAndCountry).not.toHaveBeenCalled();
      expect(prisma.profile.create).not.toHaveBeenCalled();
    });
  });
});
