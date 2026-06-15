import { IPost } from './post.interface';
import { IComment } from './comment.interface';
import { IPagination } from './pagination.interface';

export interface IPostState {
  posts: IPost[];
  loading: boolean;
  error: string | null;
  pagination: IPagination;
  selectedPost: IPost | null;
}

export interface ICommentState {
  comments: IComment[];
  loading: boolean;
  error: string | null;
  pagination: IPagination;
}
