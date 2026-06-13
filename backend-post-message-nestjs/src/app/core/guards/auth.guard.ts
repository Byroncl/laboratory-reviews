import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_KEY, AuthOptions } from '../decorators/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authOptions = this.reflector.getAllAndOverride<AuthOptions | undefined>(
      AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Auth() decorator — public endpoint
    if (authOptions === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    let payload: { username: string; sub: string; type: 'user' | 'client'; iat: number; exp: number };

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach to request so controllers can access via @Req()
    (request as any).user = {
      userId: payload.sub,
      username: payload.username,
      type: payload.type,
    };

    // If roles specified, validate role membership
    const { roles } = authOptions;
    if (roles && roles.length > 0) {
      if (!roles.includes(payload.type)) {
        throw new ForbiddenException(
          `Access restricted to roles: ${roles.join(', ')}`,
        );
      }
    }

    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
    return token;
  }
}
