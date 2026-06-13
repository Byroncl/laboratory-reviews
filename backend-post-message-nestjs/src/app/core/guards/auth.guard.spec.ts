import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

function createMockExecutionContext(authHeader = ''): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: authHeader },
      }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockReflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    } as any;

    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow public endpoints when @Auth decorator is absent', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when token is missing', async () => {
      mockReflector.getAllAndOverride.mockReturnValue({});
      const context = createMockExecutionContext('');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when authorization header is absent', async () => {
      mockReflector.getAllAndOverride.mockReturnValue({});
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockReflector.getAllAndOverride.mockReturnValue({});
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      const context = createMockExecutionContext('Bearer invalid_token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow request with valid token and no role restriction', async () => {
      const payload = {
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        type: 'user' as const,
        iat: 1000,
        exp: 9999999999,
      };
      mockReflector.getAllAndOverride.mockReturnValue({});
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      const context = createMockExecutionContext('Bearer valid_token');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should attach user to request on valid token', async () => {
      const payload = {
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        type: 'user' as const,
        iat: 1000,
        exp: 9999999999,
      };
      mockReflector.getAllAndOverride.mockReturnValue({});
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const requestObj: any = { headers: { authorization: 'Bearer valid_token' } };
      const context = {
        switchToHttp: () => ({ getRequest: () => requestObj }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      await guard.canActivate(context);

      expect(requestObj.user).toEqual({
        userId: payload.sub,
        username: payload.username,
        type: payload.type,
      });
    });

    it('should throw ForbiddenException when user type does not match required role', async () => {
      const payload = {
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        type: 'client' as const,
        iat: 1000,
        exp: 9999999999,
      };
      mockReflector.getAllAndOverride.mockReturnValue({ roles: ['user'] });
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      const context = createMockExecutionContext('Bearer valid_token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow request when user type matches required role', async () => {
      const payload = {
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        type: 'user' as const,
        iat: 1000,
        exp: 9999999999,
      };
      mockReflector.getAllAndOverride.mockReturnValue({ roles: ['user'] });
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      const context = createMockExecutionContext('Bearer valid_token');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow client type when client role is required', async () => {
      const payload = {
        username: 'testclient',
        sub: '507f1f77bcf86cd799439012',
        type: 'client' as const,
        iat: 1000,
        exp: 9999999999,
      };
      mockReflector.getAllAndOverride.mockReturnValue({ roles: ['client'] });
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      const context = createMockExecutionContext('Bearer valid_token');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow when multiple roles are required and user matches one', async () => {
      const payload = {
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        type: 'user' as const,
        iat: 1000,
        exp: 9999999999,
      };
      mockReflector.getAllAndOverride.mockReturnValue({ roles: ['user', 'client'] });
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      const context = createMockExecutionContext('Bearer valid_token');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when scheme is not Bearer', async () => {
      mockReflector.getAllAndOverride.mockReturnValue({});
      const context = createMockExecutionContext('Basic sometoken');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow when roles array is empty', async () => {
      const payload = {
        username: 'testuser',
        sub: '507f1f77bcf86cd799439011',
        type: 'user' as const,
        iat: 1000,
        exp: 9999999999,
      };
      mockReflector.getAllAndOverride.mockReturnValue({ roles: [] });
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      const context = createMockExecutionContext('Bearer valid_token');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
