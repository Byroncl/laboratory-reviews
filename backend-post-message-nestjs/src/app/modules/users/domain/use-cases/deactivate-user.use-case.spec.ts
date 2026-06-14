import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeactivateUserUseCase } from './deactivate-user.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'johndoe',
    isActive: false,
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
        DeactivateUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<DeactivateUserUseCase>(DeactivateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should deactivate a user and return the updated entity', async () => {
      mockUserRepository.deactivate.mockResolvedValue(mockUser);

      const result = await useCase.execute('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(result.isActive).toBe(false);
      expect(mockUserRepository.deactivate).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.deactivate.mockResolvedValue(null);

      await expect(useCase.execute('ghost-id')).rejects.toThrow(NotFoundException);
    });
  });
});
