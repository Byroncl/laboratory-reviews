import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(require('@nestjs/passport').AuthGuard('local'))
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with req.user and return token', async () => {
      const user = { _id: '507f1f77bcf86cd799439011', username: 'johndoe' };
      const tokenResult = { access_token: 'jwt_token' };
      mockAuthService.login.mockResolvedValue(tokenResult);

      const result = await controller.login({ user });

      expect(result).toEqual(tokenResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });

    it('should propagate errors from AuthService', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Auth error'));

      await expect(controller.login({ user: {} })).rejects.toThrow('Auth error');
    });
  });
});
