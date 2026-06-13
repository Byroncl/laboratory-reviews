export const VALIDATION = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  POST_TITLE_MIN: 3,
  POST_TITLE_MAX: 200,
  DESCRIPTION_MAX: 5000,
} as const;
