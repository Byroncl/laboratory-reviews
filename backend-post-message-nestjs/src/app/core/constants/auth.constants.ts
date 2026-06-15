export const AUTH_CONFIG = {
  JWT_SECRET: 'your-secret-key-change-in-production',
  JWT_EXPIRATION: '24h',
  JWT_REFRESH_EXPIRATION: '7d',
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  BCRYPT_ROUNDS: 10,
} as const;
