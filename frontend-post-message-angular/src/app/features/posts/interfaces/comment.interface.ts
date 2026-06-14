export interface IComment {
  id?: string;
  _id?: string;
  post: string;
  content: string;
  author?: string;
  replies?: IComment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCommentDTO {
  content: string;
  post: string;
}

export interface ICommentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IComment;
  timestamp?: string;
}

export interface ICommentListResponse {
  data: IComment[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
  message: string;
}

export interface IReactionSummary {
  emoji: string;
  count: number;
  reactedByMe?: boolean;
}

export interface IReaction {
  id?: string;
  _id?: string;
  commentId: string;
  emoji: string;
  userId?: string;
  createdAt?: Date;
}

export interface IReactionResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IReaction;
  timestamp?: string;
}
