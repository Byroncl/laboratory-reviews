import { Test, TestingModule } from '@nestjs/testing';
import { UpdateLanguagePreferenceUseCase } from './update-language-preference.use-case';
import { UserRepository } from '../repositories/user.repository';

describe('UpdateLanguagePreferenceUseCase', () => {
  let useCase: UpdateLanguagePreferenceUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed_password',
    type: 'admin',
    isActive: true,
    preferredLanguage: 'en',
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
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateLanguagePreferenceUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<UpdateLanguagePreferenceUseCase>(
      UpdateLanguagePreferenceUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update language preference to es', async () => {
      const updated = { ...mockUser, preferredLanguage: 'es' };
      mockUserRepository.updateLanguagePreference.mockResolvedValue(updated);

      const result = await useCase.execute('507f1f77bcf86cd799439011', 'es');

      expect(result).toEqual(updated);
      expect(
        mockUserRepository.updateLanguagePreference,
      ).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'es');
    });

    it('should update language preference to en', async () => {
      const updated = { ...mockUser, preferredLanguage: 'en' };
      mockUserRepository.updateLanguagePreference.mockResolvedValue(updated);

      const result = await useCase.execute('507f1f77bcf86cd799439011', 'en');

      expect(result).toEqual(updated);
      expect(
        mockUserRepository.updateLanguagePreference,
      ).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'en');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.updateLanguagePreference.mockResolvedValue(null);

      const result = await useCase.execute('ghost-id', 'es');

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      mockUserRepository.updateLanguagePreference.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        useCase.execute('507f1f77bcf86cd799439011', 'es'),
      ).rejects.toThrow('DB error');
    });
  });
});
