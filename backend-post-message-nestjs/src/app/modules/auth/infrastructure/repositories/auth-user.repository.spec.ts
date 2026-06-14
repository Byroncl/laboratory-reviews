import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AuthUserRepository } from './auth-user.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { CryptoUtils } from '../../../../core/utils/crypto.utils';
import { User } from '../../schemas/user.schema';

jest.mock('../../../../core/utils/crypto.utils');

describe('AuthUserRepository', () => {
  let repository: AuthUserRepository;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser: Partial<User> = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011') as any,
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    type: 'user',
  };

  beforeEach(async () => {
    const userRepositoryMock = {
      findOneByUsername: jest.fn(),
      updateLastLogin: jest.fn(),
      create: jest.fn(),
      findOneById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateLanguagePreference: jest.fn(),
      assignRole: jest.fn(),
      changePassword: jest.fn(),
      findOneByEmail: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUserRepository,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    repository = module.get<AuthUserRepository>(AuthUserRepository);
    userRepository = module.get(UserRepository) as jest.Mocked<UserRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCredentials', () => {
    it('should return user if credentials are valid', async () => {
      const mockUserObj = mockUser as User;
      userRepository.findOneByUsername.mockResolvedValue(mockUserObj);
      (CryptoUtils.comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await repository.validateCredentials(
        'testuser',
        'password123',
      );

      expect(result).toEqual(mockUserObj);
      expect(userRepository.findOneByUsername).toHaveBeenCalledWith('testuser');
      expect(CryptoUtils.comparePasswords).toHaveBeenCalledWith(
        'password123',
        'hashed_password',
      );
    });

    it('should return null if user not found', async () => {
      userRepository.findOneByUsername.mockResolvedValue(null);

      const result = await repository.validateCredentials(
        'invaliduser',
        'password123',
      );

      expect(result).toBeNull();
      expect(CryptoUtils.comparePasswords).not.toHaveBeenCalled();
    });

    it('should return null if password does not match', async () => {
      const mockUserObj = mockUser as User;
      userRepository.findOneByUsername.mockResolvedValue(mockUserObj);
      (CryptoUtils.comparePasswords as jest.Mock).mockResolvedValue(false);

      const result = await repository.validateCredentials(
        'testuser',
        'wrongpassword',
      );

      expect(result).toBeNull();
      expect(CryptoUtils.comparePasswords).toHaveBeenCalledWith(
        'wrongpassword',
        'hashed_password',
      );
    });
  });

  describe('findUserByUsername', () => {
    it('should return user if found', async () => {
      const mockUserObj = mockUser as User;
      userRepository.findOneByUsername.mockResolvedValue(mockUserObj);

      const result = await repository.findUserByUsername('testuser');

      expect(result).toEqual(mockUserObj);
      expect(userRepository.findOneByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should return null if user not found', async () => {
      userRepository.findOneByUsername.mockResolvedValue(null);

      const result = await repository.findUserByUsername('invaliduser');

      expect(result).toBeNull();
    });
  });

  describe('recordLoginAttempt', () => {
    it('should update last login timestamp', async () => {
      userRepository.updateLastLogin.mockResolvedValue(void 0);

      await repository.recordLoginAttempt('507f1f77bcf86cd799439011');

      expect(userRepository.updateLastLogin).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should handle errors gracefully', async () => {
      userRepository.updateLastLogin.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        repository.recordLoginAttempt('507f1f77bcf86cd799439011'),
      ).rejects.toThrow('Database error');
    });
  });
});
