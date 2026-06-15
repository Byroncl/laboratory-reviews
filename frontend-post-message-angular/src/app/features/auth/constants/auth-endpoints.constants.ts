export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password'
} as const;

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
  EXPIRES_AT: 'auth_expires_at'
} as const;

export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry
export const TOKEN_EXPIRY_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
