export type UserType = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type PostStatus = 'published' | 'draft' | 'archived';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ASSIGN' | 'ACTIVATE' | 'DEACTIVATE';
export type AuditEntityType = 'user' | 'role' | 'permission' | 'post' | 'comment' | 'category' | 'file' | 'client';

export interface User {
  _id: string;
  name: string;
  lastname: string;
  username: string;
  email: string;
  type: UserType;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: string;
  title: string;
  body: string;
  author: string;
  status: PostStatus;
  categoryId?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  createdAt: Date;
}

export interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  growthPercentage: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
