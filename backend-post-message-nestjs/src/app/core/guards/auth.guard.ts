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
import { JwtPayload } from '../interfaces/user.interface';
import { CurrentUserPayload } from '../interfaces/user.interface';
import { TranslationService } from '../utils/translation.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly i18n: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authOptions = this.reflector.getAllAndOverride<
      AuthOptions | undefined
    >(AUTH_KEY, [context.getHandler(), context.getClass()]);

    // No @Auth() decorator — public endpoint
    if (authOptions === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException(this.i18n.translate('auth.missing_token'));
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
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
