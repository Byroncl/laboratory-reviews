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
import { AUTH_KEY, AuthOptions } from '../decorators/auth.decorator';
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

      // No @Auth() decorator — public endpoint
      if (authOptions === undefined) {
        this.logger.debug('AuthGuard: no auth required (no @Auth decorator)');
        return true;
      }

      this.logger.debug('AuthGuard: auth required, extracting token...');
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractBearerToken(request);

      if (!token) {
        this.logger.warn('AuthGuard: missing token');
        const msg = this.i18n.translate('auth.missing_token');
        throw new UnauthorizedException(msg);
      }

      this.logger.debug('AuthGuard: verifying token...');
      let payload: JwtPayload;

      try {
        payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      } catch (error) {
        this.logger.error(`AuthGuard: token verification failed: ${error}`);
        throw new UnauthorizedException(this.i18n.translate('auth.invalid_token'));
      }

      const currentUser: CurrentUserPayload = {
        userId: payload.sub,
        username: payload.username,
        type: payload.type,
      };

      // Attach to request so controllers can access via @Req() or @CurrentUser()
      (request as any).user = currentUser;

      // If roles specified, validate role membership
      const { roles } = authOptions;
      if (roles && roles.length > 0) {
        if (!roles.includes(payload.type)) {
          throw new ForbiddenException(
            `${this.i18n.translate('auth.access_denied')}: ${roles.join(', ')}`,
          );
        }
      }

      this.logger.debug('AuthGuard: auth check passed');
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
