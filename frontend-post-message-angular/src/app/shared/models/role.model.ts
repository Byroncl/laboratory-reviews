import { Permission } from './permission.model';

export interface Role {
  id?: string;
  _id?: string;
  name: string;
  identifier?: string;
  permissions?: string[] | Permission[];
  permissionIds?: string[];
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateRoleDto {
  name: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: string[];
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

export interface RoleResponse {
  data: Role;
  message: string;
}

export interface RolesListResponse {
  data: Role[];
  message: string;
}

export interface RolesPaginatedResponse {
  data: {
    items: Role[];
    total: number;
  };
  message: string;
}
