import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockI18nService: jest.Mocked<I18nService>;

  beforeEach(async () => {
    mockAuthService = {
      validateCredentials: jest.fn(),
      login: jest.fn(),
    } as any;

    mockI18nService = {
      translate: jest.fn((key: string) => key),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should validate user credentials and return token with type user', async () => {
      const credentials: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };
      const user = { _id: '507f1f77bcf86cd799439011', username: 'johndoe' };
      const tokenResult = { access_token: 'jwt_token' };

      mockAuthService.validateCredentials.mockResolvedValue({
        data: user,
        type: 'user',
      });
      mockAuthService.login.mockResolvedValue(tokenResult);

      const result = await controller.login(credentials);

      expect(mockAuthService.validateCredentials).toHaveBeenCalledWith(
        credentials.username,
        credentials.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ ...tokenResult, userType: 'user' });
    });

    it('should validate client credentials and return token with type client', async () => {
      const credentials: LoginDto = {
        username: 'clientuser',
        password: 'password123',
      };
      const client = { _id: '607f1f77bcf86cd799439012', username: 'clientuser' };
      const tokenResult = { access_token: 'jwt_token_client' };

      mockAuthService.validateCredentials.mockResolvedValue({
        data: client,
        type: 'client',
      });
      mockAuthService.login.mockResolvedValue(tokenResult);

      const result = await controller.login(credentials);

      expect(mockAuthService.validateCredentials).toHaveBeenCalledWith(
        credentials.username,
        credentials.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(client);
      expect(result).toEqual({ ...tokenResult, userType: 'client' });
    });

    it('should throw BadRequestException when validation fails', async () => {
      const credentials: LoginDto = {
        username: 'invalid',
        password: 'invalid',
      };

      mockAuthService.validateCredentials.mockResolvedValue(null);

      await expect(controller.login(credentials)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
