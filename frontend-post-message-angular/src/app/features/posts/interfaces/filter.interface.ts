import { PostStatus } from '../types';

export interface IPostFilters {
  searchTerm?: string;
  author?: string;
  status?: PostStatus;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  categoryId?: string;
  limit?: number;
  skip?: number;
}

export interface ICommentFilters {
  searchTerm?: string;
  author?: string;
  postId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
