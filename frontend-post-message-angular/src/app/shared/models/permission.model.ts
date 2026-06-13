export enum PermissionType {
  USER = 'user',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  COMMENTS = 'comments',
  CLIENTS = 'clients',
  STATISTICS = 'statistics',
  AUDITS = 'audits',
}

export interface Permission {
  id?: string;
  _id?: string;
  name: string;
  identifier?: string;
  type?: PermissionType | string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreatePermissionDto {
  name: string;
  type: PermissionType | string;
}

export interface UpdatePermissionDto {
  name?: string;
  type?: PermissionType | string;
}

export interface PermissionResponse {
  data: Permission;
  message: string;
}

export interface PermissionsListResponse {
  data: Permission[];
  message: string;
}

export interface PermissionsPaginatedResponse {
  data: {
    items: Permission[];
    total: number;
  };
  message: string;
}
