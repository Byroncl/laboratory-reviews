import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsAuthGuard } from './ws-auth.guard';

describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;
  let mockJwtService: jest.Mocked<JwtService>;

  const buildContext = (token: string | undefined): ExecutionContext =>
    ({
      switchToWs: () => ({
        getClient: () => ({
          handshake: { auth: { token } },
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    mockJwtService = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    guard = new WsAuthGuard(mockJwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false when no token is provided', () => {
      const ctx = buildContext(undefined);
      expect(guard.canActivate(ctx)).toBe(false);
    });

    it('should return false when token is an empty string', () => {
      const ctx = buildContext('');
      expect(guard.canActivate(ctx)).toBe(false);
    });

    it('should return true when token is valid', () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1', username: 'testuser' });
      const ctx = buildContext('valid-token');
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should return false when JwtService.verify throws', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });
      const ctx = buildContext('bad-token');
      expect(guard.canActivate(ctx)).toBe(false);
    });

    it('should attach userId and username to the client when token is valid', () => {
      const payload = { sub: 'user-42', username: 'alice' };
      mockJwtService.verify.mockReturnValue(payload);

      const mockClient = { handshake: { auth: { token: 'good-token' } } } as any;
      const ctx = {
        switchToWs: () => ({ getClient: () => mockClient }),
      } as unknown as ExecutionContext;

      guard.canActivate(ctx);

      expect(mockClient.userId).toBe('user-42');
      expect(mockClient.username).toBe('alice');
    });
  });
});
