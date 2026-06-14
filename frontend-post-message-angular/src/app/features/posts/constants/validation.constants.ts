export const POST_VALIDATION = {
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  BODY_MIN: 10,
  BODY_MAX: 5000,
  AUTHOR_MIN: 2,
  AUTHOR_MAX: 100,
} as const;

export const COMMENT_VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  BODY_MIN: 1,
  BODY_MAX: 1000,
} as const;
