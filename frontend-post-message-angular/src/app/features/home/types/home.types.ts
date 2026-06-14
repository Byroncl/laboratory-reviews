export type { PostViewModel } from '../../../shared/models/post.model';

export interface HomeState {
  loading: boolean;
  error: string | null;
}

export interface PostFilter {
  query: string;
}
