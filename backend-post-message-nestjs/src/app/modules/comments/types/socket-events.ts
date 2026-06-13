export interface CommentMedia {
  url: string;
  type: string;
  filename: string;
}

export interface CommentCreatedEvent {
  id: string;
  postId: string;
  userId: string;
  content: string;
  media: CommentMedia[];
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

export interface ReactionAddedEvent {
  commentId: string;
  emoji: string;
  userId: string;
  username: string;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export interface ReactionRemovedEvent {
  commentId: string;
  emoji: string;
  userId: string;
  username: string;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export interface CommentReplyCreatedEvent {
  parentCommentId: string;
  reply: CommentMedia & Record<string, unknown>;
  username: string;
}

export interface CommentThreadEvent {
  thread: {
    root: Record<string, unknown>;
    totalInThread: number;
  };
}
