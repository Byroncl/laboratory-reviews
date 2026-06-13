export interface Role {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  permissions?: string[];
  permissionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
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
