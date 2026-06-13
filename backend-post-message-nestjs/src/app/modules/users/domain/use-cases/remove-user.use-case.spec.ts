import { Test, TestingModule } from '@nestjs/testing';
import { RemoveUserUseCase } from './remove-user.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('RemoveUserUseCase', () => {
  let useCase: RemoveUserUseCase;
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
        RemoveUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<RemoveUserUseCase>(RemoveUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should remove a user and return the deleted entity', async () => {
      mockUserRepository.remove.mockResolvedValue(mockUser);

      const result = await useCase.execute('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.remove.mockResolvedValue(null);

      const result = await useCase.execute('507f1f77bcf86cd799439099');

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      mockUserRepository.remove.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute('507f1f77bcf86cd799439011'),
      ).rejects.toThrow('DB error');
    });
  });
});
