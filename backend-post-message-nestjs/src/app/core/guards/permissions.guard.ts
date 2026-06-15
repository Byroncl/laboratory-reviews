import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/has-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger('PermissionsGuard');

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    this.logger.debug(`Checking permission: ${requiredPermission}`);
    this.logger.debug(`User: ${user ? user.username : 'none'}`);
    this.logger.debug(`User.role: ${user?.role ? JSON.stringify(user.role) : 'none'}`);

    if (!user || !user.role) {
      this.logger.warn(`User or role missing - denying access`);
      return false;
    }

    const hasPermission = user.role.permissions?.some(
      (permission) => permission.identifier === requiredPermission,
    );

    this.logger.debug(`Permission check result: ${hasPermission}`);
    return hasPermission || false;
  }
}
