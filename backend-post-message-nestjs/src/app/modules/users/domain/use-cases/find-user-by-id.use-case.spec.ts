import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
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
        FindUserByIdUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return the user when found by id', async () => {
      mockUserRepository.findOneById.mockResolvedValue(mockUser);

      const result = await useCase.execute('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);

      const result = await useCase.execute('507f1f77bcf86cd799439099');

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      mockUserRepository.findOneById.mockRejectedValue(new Error('Invalid ObjectId'));

      await expect(useCase.execute('invalid-id')).rejects.toThrow('Invalid ObjectId');
    });
  });
});
