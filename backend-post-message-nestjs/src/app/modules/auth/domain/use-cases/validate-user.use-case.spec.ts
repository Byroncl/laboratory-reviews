import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ValidateUserUseCase } from './validate-user.use-case';
import { AuthRepository } from '../repositories/auth.repository';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { User } from '../../schemas/user.schema';

describe('ValidateUserUseCase', () => {
  let useCase: ValidateUserUseCase;
  let authRepository: jest.Mocked<AuthRepository>;
  let i18nService: jest.Mocked<I18nService>;

  const mockUser: Partial<User> = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011') as any,
    username: 'testuser',
    email: 'test@example.com',
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
        ValidateUserUseCase,
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

    useCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
    authRepository = module.get(AuthRepository) as jest.Mocked<AuthRepository>;
    i18nService = module.get(I18nService) as jest.Mocked<I18nService>;
  });

  describe('execute', () => {
    it('should return user if credentials are valid', async () => {
      authRepository.validateCredentials.mockResolvedValue(
        mockUser as User,
      );

      const result = await useCase.execute('testuser', 'password123');

      expect(result).toEqual(mockUser);
      expect(authRepository.validateCredentials).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
    });

    it('should return null if user is not found', async () => {
      authRepository.validateCredentials.mockResolvedValue(null);

      const result = await useCase.execute('invaliduser', 'password123');

      expect(result).toBeNull();
      expect(authRepository.validateCredentials).toHaveBeenCalledWith(
        'invaliduser',
        'password123',
      );
    });

    it('should return null on repository error', async () => {
      authRepository.validateCredentials.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute('testuser', 'password123');

      expect(result).toBeNull();
    });
  });
});
