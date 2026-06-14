export interface NotificationDto {
  id?: string;
  _id?: string;
  userId: string;
  type: 'comment_created' | 'reply_created' | 'reaction_added' | 'user_joined';
  actorId: string;
  actorName: string;
  postId: string;
  commentId?: string;
  parentCommentId?: string;
  emoji?: string;
  message: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationsResponse {
  items: NotificationDto[];
  total: number;
  unread: number;
}

export interface CreateNotificationDto {
  userId: string;
  type: 'comment_created' | 'reply_created' | 'reaction_added' | 'user_joined';
  actorId: string;
  actorName: string;
  postId: string;
  commentId?: string;
  parentCommentId?: string;
  emoji?: string;
  message: string;
}

export interface NotificationApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedNotificationsResponse {
  items: NotificationDto[];
  total: number;
  page: number;
  limit: number;
  unread: number;
}
