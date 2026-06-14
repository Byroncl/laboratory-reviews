export enum NotificationType {
  COMMENT_CREATED = 'comment_created',
  REPLY_CREATED = 'reply_created',
  REACTION_ADDED = 'reaction_added',
  USER_JOINED = 'user_joined',
}

export interface Notification {
  id?: string;
  _id?: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  postId: string;
  commentId?: string;
  parentCommentId?: string;
  emoji?: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  unread: number;
}
