export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ReactionsResponse {
  commentId: string;
  reactions: Reaction[];
  total: number;
  userReacted: boolean;
  userReaction?: string;
}

export interface CreateReactionDto {
  commentId: string;
  emoji: string;
}
