import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_KEY, AuthOptions, OPTIONAL_AUTH_KEY } from '../decorators/auth.decorator';
import { JwtPayload } from '../interfaces/user.interface';
import { CurrentUserPayload } from '../interfaces/user.interface';
import { TranslationService } from '../utils/translation.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger('JwtAuthGuard');

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly i18n: TranslationService,
  ) {}


  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      this.logger.debug('AuthGuard: checking auth...');
      const authOptions = this.reflector.getAllAndOverride<
        AuthOptions | undefined
      >(AUTH_KEY, [context.getHandler(), context.getClass()]);

      const optionalAuth = this.reflector.getAllAndOverride<boolean | undefined>(
        OPTIONAL_AUTH_KEY,
        [context.getHandler(), context.getClass()],
      );

      // No @Auth() and no @OptionalAuth() — public endpoint
      if (authOptions === undefined && !optionalAuth) {
        this.logger.debug('AuthGuard: no auth required (no @Auth decorator)');
        return true;
      }

      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractBearerToken(request);

      // If token exists, try to extract user (works for @Auth() and @OptionalAuth())
      if (token) {
        this.logger.debug('AuthGuard: token found, verifying...');
        try {
          const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
          const currentUser: CurrentUserPayload = {
            userId: payload.sub,
            username: payload.username,
            type: payload.type,
          };
          (request as any).user = currentUser;

          // If @Auth() with roles, validate them
          if (authOptions) {
            const { roles } = authOptions;
            if (roles && roles.length > 0) {
              if (!roles.includes(payload.type)) {
                throw new ForbiddenException(
                  `${this.i18n.translate('auth.access_denied')}: ${roles.join(', ')}`,
                );
              }
            }
          }

          this.logger.debug('AuthGuard: auth check passed');
          return true;
        } catch (error) {
          // Token exists but invalid — fail for @Auth(), allow for @OptionalAuth()
          if (authOptions) {
            this.logger.error(`AuthGuard: token verification failed: ${error}`);
            throw new UnauthorizedException(this.i18n.translate('auth.invalid_token'));
          }
          this.logger.warn('AuthGuard: invalid token but optional, continuing as public');
          return true;
        }
      }

      // No token
      if (authOptions) {
        // @Auth() requires token
        this.logger.warn('AuthGuard: missing token but @Auth() required');
        throw new UnauthorizedException(this.i18n.translate('auth.missing_token'));
      }

      // @OptionalAuth() without token — just continue
      this.logger.debug('AuthGuard: no token but @OptionalAuth() allows it');
      return true;
    } catch (error) {
      this.logger.error(`AuthGuard error: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
    return token;
  }
}
