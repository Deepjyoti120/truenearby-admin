import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../photos/imagekit.service';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: {
    profile: {
      findUnique: jest.Mock;
    };
    post: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let imageKitService: {
    uploadFile: jest.Mock;
    deleteFileById: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
            },
            post: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: ImageKitService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFileById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get(PrismaService);
    imageKitService = module.get(ImageKitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates the post and upserts latest_user_posts in the same transaction', async () => {
      const tx = {
        post: {
          create: jest.fn(),
        },
        $executeRaw: jest.fn(),
      };
      const createdPost = {
        id: 'post-1',
        userId: 'user-1',
        prompt: 'Weekend vibes',
        imageUrls: ['https://example.com/post-1.jpg'],
        imageFileIds: ['file-1'],
        latitude: 28.6139,
        longitude: 77.209,
        createdAt: new Date('2026-03-22T00:00:00.000Z'),
        updatedAt: new Date('2026-03-22T00:00:00.000Z'),
      };

      prisma.profile.findUnique.mockResolvedValue({
        latitude: 28.6139,
        longitude: 77.209,
      });
      imageKitService.uploadFile.mockResolvedValue({
        url: 'https://example.com/post-1.jpg',
        fileId: 'file-1',
      });
      tx.post.create.mockResolvedValue(createdPost);
      tx.$executeRaw.mockResolvedValue(1);
      prisma.$transaction.mockImplementation(async (callback) => callback(tx));

      const result = await service.create(
        'user-1',
        {
          prompt: ' Weekend vibes ',
        },
        [{} as Express.Multer.File],
      );

      expect(tx.post.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          prompt: 'Weekend vibes',
          imageUrls: ['https://example.com/post-1.jpg'],
          imageFileIds: ['file-1'],
          latitude: 28.6139,
          longitude: 77.209,
        },
      });
      expect(tx.$executeRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('INSERT INTO "latest_user_posts"'),
        }),
      );
      expect(result).toEqual({
        success: true,
        post: createdPost,
      });
    });
  });

  describe('delete', () => {
    it('recomputes latest_user_posts after deleting a post', async () => {
      const tx = {
        post: {
          delete: jest.fn(),
        },
        $queryRaw: jest.fn(),
        $executeRaw: jest.fn(),
      };

      prisma.post.findFirst.mockResolvedValue({
        id: 'post-2',
        userId: 'user-1',
        imageFileIds: ['file-2'],
      });
      imageKitService.deleteFileById.mockResolvedValue(undefined);
      tx.post.delete.mockResolvedValue({
        id: 'post-2',
      });
      tx.$queryRaw.mockResolvedValue([
        {
          id: 'post-1',
          createdAt: new Date('2026-03-21T00:00:00.000Z'),
          latitude: 28.6139,
          longitude: 77.209,
        },
      ]);
      tx.$executeRaw.mockResolvedValue(1);
      prisma.$transaction.mockImplementation(async (callback) => callback(tx));

      const result = await service.delete('user-1', 'post-2');

      expect(tx.post.delete).toHaveBeenCalledWith({
        where: { id: 'post-2' },
      });
      expect(tx.$queryRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('FROM "posts" p'),
        }),
      );
      expect(tx.$executeRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('INSERT INTO "latest_user_posts"'),
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it('removes latest_user_posts when the user has no posts left', async () => {
      const tx = {
        post: {
          delete: jest.fn(),
        },
        $queryRaw: jest.fn(),
        $executeRaw: jest.fn(),
      };

      prisma.post.findFirst.mockResolvedValue({
        id: 'post-2',
        userId: 'user-1',
        imageFileIds: [],
      });
      tx.post.delete.mockResolvedValue({
        id: 'post-2',
      });
      tx.$queryRaw.mockResolvedValue([]);
      tx.$executeRaw.mockResolvedValue(1);
      prisma.$transaction.mockImplementation(async (callback) => callback(tx));

      const result = await service.delete('user-1', 'post-2');

      expect(tx.$executeRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('DELETE FROM "latest_user_posts"'),
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });
});
