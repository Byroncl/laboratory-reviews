import { PostStatus } from '../types';

export interface IPostFilters {
  searchTerm?: string;
  author?: string;
  status?: PostStatus;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

export interface ICommentFilters {
  searchTerm?: string;
  email?: string;
  postId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
