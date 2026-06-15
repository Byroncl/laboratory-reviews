import { HttpErrorResponse } from '@angular/common/http';
import { AUTH_ERROR_MAP, AUTH_MESSAGES } from '../constants';
import { IAuthError } from '../interfaces';

/**
 * Map HTTP error to auth error with user-friendly message
 */
export function mapAuthError(error: HttpErrorResponse): IAuthError {
  const errorCode = error.error?.code || error.status.toString();
  const message = AUTH_ERROR_MAP[errorCode] || getDefaultErrorMessage(error.status);

  return {
    code: errorCode,
    message,
    statusCode: error.status
  };
}

/**
 * Get default error message based on HTTP status code
 */
export function getDefaultErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request',
    401: AUTH_MESSAGES.UNAUTHORIZED,
    403: AUTH_MESSAGES.FORBIDDEN,
    404: 'Resource not found',
    409: 'Resource already exists',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.'
  };

  return messages[statusCode] || AUTH_MESSAGES.NETWORK_ERROR;
}

/**
 * Extract error code from error response
 */
export function extractErrorCode(error: HttpErrorResponse): string {
  return error.error?.code || error.error?.message || error.status.toString();
}

/**
 * Check if error is due to authentication failure
 */
export function isAuthenticationError(error: HttpErrorResponse): boolean {
  return error.status === 401;
}

/**
 * Check if error is due to authorization failure
 */
export function isAuthorizationError(error: HttpErrorResponse): boolean {
  return error.status === 403;
}

/**
 * Check if error is due to validation failure
 */
export function isValidationError(error: HttpErrorResponse): boolean {
  return error.status === 400;
}

/**
 * Check if error is due to network issue
 */
export function isNetworkError(error: any): boolean {
  return !error.status || (error.status >= 500 && error.status < 600);
}
