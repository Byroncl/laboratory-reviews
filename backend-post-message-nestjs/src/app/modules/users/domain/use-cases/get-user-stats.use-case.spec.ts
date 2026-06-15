import { Test, TestingModule } from '@nestjs/testing';
import { GetUserStatsUseCase } from './get-user-stats.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('GetUserStatsUseCase', () => {
  let useCase: GetUserStatsUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByUsername: jest.fn(),
      findOneByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateLanguagePreference: jest.fn(),
      assignRole: jest.fn(),
      changePassword: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
      getStats: jest.fn(),
      updateLastLogin: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserStatsUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetUserStatsUseCase>(GetUserStatsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user statistics with total, active, verified, posts, comments, and growthPercentage counts', async () => {
      const expectedStats = {
        total: 100,
        active: 80,
        verified: 50,
        posts: 150,
        comments: 300,
        growthPercentage: 80,
      };
      mockUserRepository.getStats.mockResolvedValue(expectedStats);

      const result = await useCase.execute();

      expect(result).toEqual(expectedStats);
      expect(result.total).toBe(100);
      expect(result.active).toBe(80);
      expect(result.verified).toBe(50);
      expect(result.posts).toBe(150);
      expect(result.comments).toBe(300);
      expect(result.growthPercentage).toBe(80);
      expect(mockUserRepository.getStats).toHaveBeenCalledTimes(1);
    });

    it('should return zero counts when no users exist', async () => {
      const emptyStats = {
        total: 0,
        active: 0,
        verified: 0,
        posts: 0,
        comments: 0,
        growthPercentage: 0,
      };
      mockUserRepository.getStats.mockResolvedValue(emptyStats);

      const result = await useCase.execute();

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.verified).toBe(0);
      expect(result.posts).toBe(0);
      expect(result.comments).toBe(0);
      expect(result.growthPercentage).toBe(0);
    });
  });
});
