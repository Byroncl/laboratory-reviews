import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LoginUseCase } from './login.use-case';
import { AuthRepository } from '../repositories/auth.repository';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { User } from '../../schemas/user.schema';
import { JwtPayload } from '../../../../core/interfaces/auth.interface';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authRepository: jest.Mocked<AuthRepository>;
  let i18nService: jest.Mocked<I18nService>;

  const mockUser: Partial<User> = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011') as any,
    username: 'testuser',
    email: 'test@example.com',
    type: 'user',
  };

  beforeEach(async () => {
    const authRepositoryMock = {
      validateCredentials: jest.fn(),
      findUserByUsername: jest.fn(),
      recordLoginAttempt: jest.fn(),
    };

    const i18nServiceMock = {
      translate: jest.fn((key: string) => `Translated: ${key}`),
      getCurrentLanguage: jest.fn(() => 'en'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
        {
          provide: I18nService,
          useValue: i18nServiceMock,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    authRepository = module.get(AuthRepository) as jest.Mocked<AuthRepository>;
    i18nService = module.get(I18nService) as jest.Mocked<I18nService>;
  });

  describe('execute', () => {
    it('should return JWT payload if credentials are valid', async () => {
      const mockUserObj = mockUser as User;
      authRepository.validateCredentials.mockResolvedValue(mockUserObj);
      authRepository.recordLoginAttempt.mockResolvedValue(void 0);

      const result = await useCase.execute('testuser', 'password123');

      expect(result).toEqual<JwtPayload>({
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        type: 'user',
      });

      expect(authRepository.validateCredentials).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
      expect(authRepository.recordLoginAttempt).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      authRepository.validateCredentials.mockResolvedValue(null);

      await expect(
        useCase.execute('invaliduser', 'password123'),
      ).rejects.toThrow(BadRequestException);

      expect(i18nService.translate).toHaveBeenCalledWith(
        'auth.user_not_found',
      );
    });

    it('should throw BadRequestException if user has no _id', async () => {
      const userWithoutId = { ...mockUser, _id: undefined };
      authRepository.validateCredentials.mockResolvedValue(
        userWithoutId as unknown as User,
      );

      await expect(
        useCase.execute('testuser', 'password123'),
      ).rejects.toThrow(BadRequestException);

      expect(i18nService.translate).toHaveBeenCalledWith(
        'auth.user_not_found',
      );
    });

    it('should throw BadRequestException on repository error', async () => {
      authRepository.validateCredentials.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        useCase.execute('testuser', 'password123'),
      ).rejects.toThrow(BadRequestException);

      expect(i18nService.translate).toHaveBeenCalledWith(
        'auth.login_failed',
      );
    });

    it('should default user type to "user" if not specified', async () => {
      const userWithoutType = { ...mockUser, type: undefined } as unknown as User;
      authRepository.validateCredentials.mockResolvedValue(userWithoutType);
      authRepository.recordLoginAttempt.mockResolvedValue(void 0);

      const result = await useCase.execute('testuser', 'password123');

      expect(result.type).toBe('user');
    });
  });
});
