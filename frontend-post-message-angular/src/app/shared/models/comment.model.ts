export interface CommentMedia {
  url: string;
  type: string;
  filename: string;
}

export interface Comment {
  id?: string;
  _id?: string;
  content: string;
  userId: string;
  username?: string;
  postId: string;
  parentCommentId?: string | null;
  childCommentIds?: string[];
  createdAt: string;
  updatedAt: string;
  media?: CommentMedia[];
  replyCount?: number;
  replies?: Comment[];
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  userId?: string;
  parentCommentId?: string;
  mediaUrls?: string[];
  mediaTypes?: string[];
  mediaFilenames?: string[];
}

export interface CommentResponse {
  data: Comment;
  message: string;
}

export interface CommentsListResponse {
  data: Comment[];
  message: string;
}
