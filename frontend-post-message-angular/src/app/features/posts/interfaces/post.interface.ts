import { PostStatus } from '../types';

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
}

export interface ICreatePostDTO {
  title: string;
  content: string;
  status?: PostStatus;
  tags?: string[];
}

export interface IUpdatePostDTO {
  title?: string;
  content?: string;
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
