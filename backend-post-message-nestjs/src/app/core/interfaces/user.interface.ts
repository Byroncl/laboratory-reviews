import { AuthRole } from '../types/common.types';

export interface PermissionPayload {
  _id: string;
  identifier: string;
  name: string;
}

export interface RolePayload {
  _id: string;
  name: string;
  identifier: string;
  permissions: PermissionPayload[];
}

export interface CurrentUserPayload {
  userId: string;
  username: string;
  type: AuthRole;
  role?: RolePayload;
}

export interface JwtPayload {
  username: string;
  sub: string;
  type: AuthRole;
  iat?: number;
  exp?: number;
}
