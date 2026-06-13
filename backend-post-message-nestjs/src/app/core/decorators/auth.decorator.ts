import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export const AUTH_KEY = 'auth_options';

export type AuthRole = 'user' | 'client';

export interface AuthOptions {
  roles?: AuthRole[];
}

export const Auth = (options: AuthOptions = {}): MethodDecorator &
  ClassDecorator =>
  applyDecorators(SetMetadata(AUTH_KEY, options), ApiBearerAuth());
