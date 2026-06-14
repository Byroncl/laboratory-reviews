export const PROFILE_VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  LASTNAME_MIN: 2,
  LASTNAME_MAX: 100,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  BIO_MAX: 500,
  PHONE_PATTERN: /^\+?[\d\s\-()]{7,}$/,
} as const;

export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  STRENGTH_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;
