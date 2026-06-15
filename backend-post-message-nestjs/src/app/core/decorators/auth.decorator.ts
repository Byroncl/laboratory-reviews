import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthRole } from '../types/common.types';

export const AUTH_KEY = 'auth_options';
export const OPTIONAL_AUTH_KEY = 'optional_auth';

export interface AuthOptions {
  roles?: AuthRole[];
}

export const Auth = (options: AuthOptions = {}): MethodDecorator &
  ClassDecorator =>
  applyDecorators(SetMetadata(AUTH_KEY, options), ApiBearerAuth());

export const OptionalAuth = (): MethodDecorator &
  ClassDecorator =>
  applyDecorators(SetMetadata(OPTIONAL_AUTH_KEY, true), ApiBearerAuth());
