import { AuthRole } from '../types/common.types';

export interface JwtPayload {
  username: string;
  sub: string;
  type: AuthRole;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
}
