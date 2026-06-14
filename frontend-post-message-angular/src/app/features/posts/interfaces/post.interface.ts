import { PostStatus } from '../types';

export interface IPost {
  id?: string;
  _id?: string;
  title: string;
  body: string;
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
  body: string;
  author: string;
  tags?: string[];
}

export interface IUpdatePostDTO {
  title?: string;
  body?: string;
  author?: string;
  status?: PostStatus;
  tags?: string[];
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
