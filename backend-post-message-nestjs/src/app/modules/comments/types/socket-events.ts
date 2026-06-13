export interface CommentCreatedEvent {
  id: string;
  postId: string;
  userId: string;
  content: string;
  username: string;
  createdAt: Date;
  message: string;
}

export interface CommentUpdatedEvent {
  id: string;
  content: string;
  updatedAt: Date;
  updatedBy: string;
  message: string;
}

export interface CommentDeletedEvent {
  id: string;
  deletedBy: string;
  message: string;
}

export interface CommentTypingEvent {
  postId: string;
  username: string;
}

export interface UserJoinedEvent {
  userId: string;
  username: string;
  message: string;
}

export interface UserConnectedEvent {
  clientId: string;
  totalConnected: number;
}
