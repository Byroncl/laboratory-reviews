export const POSTS_API_ENDPOINTS = {
  LIST: '/posts',
  DETAIL: '/posts/:id',
  CREATE: '/posts',
  UPDATE: '/posts/:id',
  DELETE: '/posts/:id',
  BULK: '/posts/bulk',
  STATUS: '/posts/:id/status',
} as const;

export const COMMENTS_API_ENDPOINTS = {
  LIST: '/comments',
  BY_POST: '/posts/:postId/comments',
  CREATE: '/comments',
  UPDATE: '/comments/:id',
  DELETE: '/comments/:id',
  REPLIES: '/comments/:id/replies',
  REACTIONS: '/comments/:id/reactions',
  REACTION_BY_EMOJI: '/comments/:id/reactions/:emoji',
} as const;
