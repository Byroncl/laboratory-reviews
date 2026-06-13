export interface Post {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  body?: string;
  author: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title: string;
  body: string;
  author: string;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
  author?: string;
}

export interface PostResponse {
  data: Post;
  message: string;
}

export interface PostsListResponse {
  data: Post[];
  message: string;
}
