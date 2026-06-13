import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByUsernameUseCase } from './find-user-by-username.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('FindUserByUsernameUseCase', () => {
  let useCase: FindUserByUsernameUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed',
    type: 'admin',
    isActive: true,
  } as any;

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
        FindUserByUsernameUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<FindUserByUsernameUseCase>(FindUserByUsernameUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return the user when found by username', async () => {
      mockUserRepository.findOneByUsername.mockResolvedValue(mockUser);

      const result = await useCase.execute('johndoe');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneByUsername).toHaveBeenCalledWith('johndoe');
    });

    it('should return null when username does not exist', async () => {
      mockUserRepository.findOneByUsername.mockResolvedValue(null);

      const result = await useCase.execute('nonexistent');

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      mockUserRepository.findOneByUsername.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(useCase.execute('johndoe')).rejects.toThrow('DB error');
    });
  });
});
