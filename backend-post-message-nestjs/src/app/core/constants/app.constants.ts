export const APP_CONFIG = {
  NAME: 'backend-post-message',
  VERSION: '1.0.0',
  DESCRIPTION: 'Post message backend API',
} as const;

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];
