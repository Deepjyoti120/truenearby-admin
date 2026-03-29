import { Test, TestingModule } from '@nestjs/testing';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

describe('LikesController', () => {
  let controller: LikesController;
  const likesService = {
    getLikes: jest.fn(),
    acceptLike: jest.fn(),
    unlockLikes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [
        {
          provide: LikesService,
          useValue: likesService,
        },
      ],
    }).compile();

    controller = module.get<LikesController>(LikesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('accepts a like for the authenticated user', async () => {
    await controller.acceptLike({ id: 'user-1' }, '2e9725bb-8fe0-4f00-bb62-5c4b60ff2f6d');

    expect(likesService.acceptLike).toHaveBeenCalledWith(
      'user-1',
      '2e9725bb-8fe0-4f00-bb62-5c4b60ff2f6d',
    );
  });
});
