import { Test, TestingModule } from '@nestjs/testing';
import { FindAllUsersUseCase } from './find-all-users.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('FindAllUsersUseCase', () => {
  let useCase: FindAllUsersUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUsers = [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password_hash: 'hashed',
      type: 'admin',
      isActive: true,
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Jane',
      lastname: 'Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      password_hash: 'hashed',
      type: 'viewer',
      isActive: true,
    },
  ] as any[];

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByUsername: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUsersUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<FindAllUsersUseCase>(FindAllUsersUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all users from repository', async () => {
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await useCase.execute();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate repository errors', async () => {
      mockUserRepository.findAll.mockRejectedValue(new Error('DB connection error'));

      await expect(useCase.execute()).rejects.toThrow('DB connection error');
    });
  });
});
