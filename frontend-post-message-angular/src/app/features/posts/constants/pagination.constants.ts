export const POSTS_PAGINATION_DEFAULTS = {
  LIMIT: 10,
  SKIP: 0,
  MAX_LIMIT: 100,
} as const;

export const COMMENTS_PAGINATION_DEFAULTS = {
  LIMIT: 5,
  SKIP: 0,
  MAX_LIMIT: 50,
} as const;
