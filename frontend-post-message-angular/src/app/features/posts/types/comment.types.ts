export type CommentAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'REPLY';

export type CommentActionPayload =
  | { type: 'CREATE'; payload: { postId: string; body: string; name: string; email: string } }
  | { type: 'UPDATE'; payload: { commentId: string; body: string } }
  | { type: 'DELETE'; payload: { commentId: string } }
  | { type: 'REPLY'; payload: { commentId: string; body: string; name: string; email: string } };
