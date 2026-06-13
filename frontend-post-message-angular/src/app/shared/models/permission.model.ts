export interface Permission {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  category?: string;
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
