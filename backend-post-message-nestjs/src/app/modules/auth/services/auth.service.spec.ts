import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ValidateUserUseCase } from '../domain/use-cases/validate-user.use-case';
import { LoginUseCase } from '../domain/use-cases/login.use-case';
import { JwtService } from '@nestjs/jwt';
import { ClientRepository } from '../../clients/infrastructure/repositories/client.repository';

describe('AuthService', () => {
  let service: AuthService;
  let mockValidateUserUseCase: { execute: jest.Mock };
  let mockLoginUseCase: { execute: jest.Mock };
  let mockJwtService: { sign: jest.Mock };

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'johndoe',
    password_hash: 'hashed_password',
    name: 'John',
    type: 'user',
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockValidateUserUseCase = { execute: jest.fn() };
    mockLoginUseCase = { execute: jest.fn(), executeFromUser: jest.fn() };
    mockJwtService = { sign: jest.fn().mockReturnValue('signed_token') };
    const mockClientRepository = { findByUsername: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ValidateUserUseCase, useValue: mockValidateUserUseCase },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ClientRepository, useValue: mockClientRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when use case succeeds', async () => {
      mockValidateUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.validateUser('johndoe', 'correct_password');

      expect(result).toEqual(mockUser);
      expect(mockValidateUserUseCase.execute).toHaveBeenCalledWith('johndoe', 'correct_password');
    });

    it('should return null when use case throws', async () => {
      mockValidateUserUseCase.execute.mockRejectedValue(new Error('Unauthorized'));

      const result = await service.validateUser('nobody', 'wrong_password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access_token by signing the payload from LoginUseCase', async () => {
      const payload = {
        username: 'johndoe',
        sub: '507f1f77bcf86cd799439011',
        type: 'user',
      };
      mockLoginUseCase.executeFromUser.mockResolvedValue(payload);

      const userObject = { _id: '507f1f77bcf86cd799439011', username: 'johndoe' };
      const result = await service.login(userObject);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('signed_token');
      expect(mockLoginUseCase.executeFromUser).toHaveBeenCalledWith(userObject);
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    });
  });
});
