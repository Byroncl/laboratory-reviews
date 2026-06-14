import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CLIENT_MESSAGES } from '../constants/client.constants';

@Injectable()
export class ClientOrAdminGuard implements CanActivate {
  constructor(private i18nService: I18nService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        this.i18nService.translate(CLIENT_MESSAGES.ACCESS_DENIED),
      );
    }

    const isClient = (user as any).type === 'client';
    const isAdmin =
      (user as any).role === 'admin' ||
      (typeof (user as any).role === 'object' && (user as any).role?.name === 'admin');

    if (!isClient && !isAdmin) {
      throw new ForbiddenException(
        this.i18nService.translate(CLIENT_MESSAGES.ACCESS_DENIED),
      );
    }

    return true;
  }
}
