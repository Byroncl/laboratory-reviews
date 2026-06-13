import { AuthRole } from '../types/common.types';

export interface CurrentUserPayload {
  userId: string;
  username: string;
  type: AuthRole;
}

export interface JwtPayload {
  username: string;
  sub: string;
  type: AuthRole;
  iat?: number;
  exp?: number;
}
