import { Test, TestingModule } from '@nestjs/testing';
import { AssignRoleUseCase } from './assign-role.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('AssignRoleUseCase', () => {
  let useCase: AssignRoleUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed',
    type: 'user',
    isActive: true,
    role: { _id: '507f1f77bcf86cd799439022', name: 'Admin' },
  } as any;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByUsername: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateLanguagePreference: jest.fn(),
      assignRole: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRoleUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<AssignRoleUseCase>(AssignRoleUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should assign a role to a user and return the updated entity', async () => {
      mockUserRepository.assignRole.mockResolvedValue(mockUser);

      const result = await useCase.execute(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439022',
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.assignRole).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439022',
      );
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.assignRole.mockResolvedValue(null);

      const result = await useCase.execute('ghost-id', '507f1f77bcf86cd799439022');

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      mockUserRepository.assignRole.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439022'),
      ).rejects.toThrow('DB error');
    });
  });
});
