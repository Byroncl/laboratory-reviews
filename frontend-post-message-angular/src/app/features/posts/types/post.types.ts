import { POST_STATUSES, POST_ACTIONS } from '../constants';

export type PostStatus = typeof POST_STATUSES[keyof typeof POST_STATUSES];
export type PostAction = typeof POST_ACTIONS[keyof typeof POST_ACTIONS];

// Discriminated union for post actions (like admin.types pattern)
export type PostActionPayload =
  | { type: 'VIEW'; payload: { postId: string } }
  | { type: 'EDIT'; payload: { postId: string } }
  | { type: 'DELETE'; payload: { postId: string } }
  | { type: 'PUBLISH'; payload: { postId: string } }
  | { type: 'ARCHIVE'; payload: { postId: string } }
  | { type: 'RESTORE'; payload: { postId: string } };

// Result type for API responses
export type PostActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
