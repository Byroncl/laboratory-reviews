export interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role?: string;
  roles?: string[];
  status?: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UserResponse {
  data: User;
  message: string;
}

export interface UsersListResponse {
  data: User[];
  message: string;
}

export interface UsersPaginatedResponse {
  data: {
    items: User[];
    total: number;
  };
  message: string;
}
