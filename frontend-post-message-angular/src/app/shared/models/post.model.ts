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

export interface PostViewModel {
  id: string;
  title: string;
  preview: string;
  authorUsername: string;
  createdAt: string;
  imageUrl?: string;
  commentCount?: number;
}

export function mapToPostViewModel(raw: any): PostViewModel {
  const text: string = raw.body ?? raw.content ?? '';
  return {
    id: (raw._id ?? raw.id) as string,
    title: raw.title as string,
    preview: text.slice(0, 200),
    authorUsername: (raw.author ?? raw.userId ?? '') as string,
    createdAt: raw.createdAt as string,
    imageUrl: raw.imageUrl as string | undefined,
    commentCount: raw.commentCount as number | undefined,
  };
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
