export interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  lastname?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  language?: string;
  preferredLanguage?: 'en' | 'es';
  roleId?: string;
  roleName?: string;
  role?: string | { _id?: string; id?: string; name?: string; [key: string]: unknown };
  roles?: string[];
  permissionCodes?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  lastLoginAt?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateUserDto {
  email: string;
  name: string;
  lastname: string;
  username: string;
  password_hash: string;
  type: string;
  firstName?: string;
  lastName?: string;
  language?: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  lastname?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  language?: string;
  type?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  total: number;
  active: number;
  verified: number;
}

export interface UserResponse {
  data: User;
  message: string;
}

export interface UsersListResponse {
  data: User[];
  message: string;
}

export interface PaginationState {
  skip: number;
  limit: number;
  total: number;
}

export interface UsersPaginatedResponse {
  data: {
    items: User[];
    total: number;
    skip: number;
    limit: number;
  };
  message: string;
}
