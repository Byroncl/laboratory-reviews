export const CORS_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
] as const;

export const CORS_ALLOWED_HEADERS_PROD = [
  'Content-Type',
  'Authorization',
  'x-api-key',
  'Accept-Language',
  'Timezone-Offset',
  'Timezone-Name',
  'skip',
  'x-device-token',
] as const;

export const NODE_ENV = {
  PRODUCTION: 'production',
} as const;
