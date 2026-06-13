import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthRole } from '../types/common.types';

export const AUTH_KEY = 'auth_options';

export interface AuthOptions {
  roles?: AuthRole[];
}

export const Auth = (options: AuthOptions = {}): MethodDecorator &
  ClassDecorator =>
  applyDecorators(SetMetadata(AUTH_KEY, options), ApiBearerAuth());
