import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActivateUserUseCase } from './activate-user.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('ActivateUserUseCase', () => {
  let useCase: ActivateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'johndoe',
    isActive: true,
  } as any;

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
        ActivateUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<ActivateUserUseCase>(ActivateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should activate a user and return the updated entity', async () => {
      mockUserRepository.activate.mockResolvedValue(mockUser);

      const result = await useCase.execute('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.activate).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.activate.mockResolvedValue(null);

      await expect(useCase.execute('ghost-id')).rejects.toThrow(NotFoundException);
    });
  });
});
