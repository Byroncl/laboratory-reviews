import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChangePasswordUseCase } from './change-password.use-case';
import { UserRepository } from '../repositories/user.repository';
import { ChangePasswordDto } from '../../dto/change-password.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('new_hashed_password'),
}));

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'old_hashed_password',
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
        ChangePasswordUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should change password when current password is valid', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      mockUserRepository.findOneById.mockResolvedValue(mockUser);
      mockUserRepository.changePassword.mockResolvedValue({ ...mockUser, password_hash: 'new_hashed_password' });

      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      await useCase.execute('507f1f77bcf86cd799439011', dto);

      expect(mockUserRepository.findOneById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockUserRepository.changePassword).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'new_hashed_password',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      mockUserRepository.findOneById.mockResolvedValue(null);

      await expect(
        useCase.execute('ghost-id', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword!',
      };
      mockUserRepository.findOneById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute('507f1f77bcf86cd799439011', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when current password is incorrect', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'WrongPassword!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      mockUserRepository.findOneById.mockResolvedValue(mockUser);

      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        useCase.execute('507f1f77bcf86cd799439011', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
