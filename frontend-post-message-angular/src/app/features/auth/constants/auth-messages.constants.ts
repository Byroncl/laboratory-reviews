export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGIN_ERROR: 'Invalid username or password',
  REGISTER_SUCCESS: 'Account created successfully. Please log in.',
  REGISTER_ERROR: 'Failed to create account',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid session token. Please log in again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please fix the errors below',
  PASSWORD_MISMATCH: 'Passwords do not match',
  EMAIL_TAKEN: 'This email is already in use',
  USERNAME_TAKEN: 'This username is already in use',
  WEAK_PASSWORD: 'Password is too weak. Use uppercase, lowercase, numbers, and symbols.',
  ACCOUNT_LOCKED: 'Account is locked. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access denied.'
} as const;

export const AUTH_ERROR_MAP: Record<string, string> = {
  'INVALID_CREDENTIALS': AUTH_MESSAGES.LOGIN_ERROR,
  'USER_NOT_FOUND': AUTH_MESSAGES.LOGIN_ERROR,
  'PASSWORD_MISMATCH': AUTH_MESSAGES.PASSWORD_MISMATCH,
  'EMAIL_TAKEN': AUTH_MESSAGES.EMAIL_TAKEN,
  'USERNAME_TAKEN': AUTH_MESSAGES.USERNAME_TAKEN,
  'WEAK_PASSWORD': AUTH_MESSAGES.WEAK_PASSWORD,
  'ACCOUNT_LOCKED': AUTH_MESSAGES.ACCOUNT_LOCKED,
  'TOKEN_EXPIRED': AUTH_MESSAGES.TOKEN_EXPIRED,
  'TOKEN_INVALID': AUTH_MESSAGES.TOKEN_INVALID,
  'UNAUTHORIZED': AUTH_MESSAGES.UNAUTHORIZED,
  'FORBIDDEN': AUTH_MESSAGES.FORBIDDEN
};
