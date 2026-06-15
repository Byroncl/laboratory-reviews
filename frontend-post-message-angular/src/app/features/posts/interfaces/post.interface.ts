import { PostStatus } from '../types';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

export interface IPost {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  author: string;
  status: PostStatus;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  viewCount?: number;
  commentCount?: number;
  reactionsCount?: number;
  categoryId?: ICategory;
  categoryName?: string;
  imageUrl?: string;
}

export interface ICreatePostDTO {
  title: string;
  content: string;
  status?: PostStatus;
  tags?: string[];
  imageUrl?: string;
}

export interface IUpdatePostDTO {
  title?: string;
  body?: string;
  status?: PostStatus;
  tags?: string[];
}

export interface IBulkCreateResponse {
  created: number;
  failed: number;
  errors?: unknown[];
}

export interface IPostResponse {
  data: IPost;
  message: string;
}

export interface IPostListResponse {
  data: IPost[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
  message: string;
}
