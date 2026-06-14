import { ClientEntityType } from './client.types';

export interface PostDto {
  _id: string;
  title: string;
  body: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  imageFilename?: string;
  categoryId?: string;
  categoryName?: string;
  isActive: boolean;
}

export interface CommentDto {
  _id: string;
  postId: string;
  name: string;
  email: string;
  body: string;
  createdAt: Date;
}

export interface ClientProfileDto {
  _id: string;
  name: string;
  lastname: string;
  username: string;
  email: string;
  type: ClientEntityType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteDto {
  _id: string;
  userId: string;
  postId: string;
  post?: PostDto;
  createdAt: Date;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T | PaginationResponse<T>;
  message?: string;
  success: boolean;
}

export interface CreatePostFormData {
  title: string;
  body: string;
  categoryId?: string;
}

export interface UpdateProfileFormData {
  name: string;
  lastname: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
}
