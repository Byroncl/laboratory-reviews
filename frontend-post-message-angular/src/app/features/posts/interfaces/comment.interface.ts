export interface IComment {
  id?: string;
  _id?: string;
  postId: string;
  name: string;
  email: string;
  body: string;
  replies?: IComment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCommentDTO {
  postId: string;
  name: string;
  email: string;
  body: string;
}

export interface ICommentResponse {
  data: IComment;
  message: string;
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
