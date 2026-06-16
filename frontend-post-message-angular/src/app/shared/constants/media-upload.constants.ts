// TODO: keep in sync with backend validation
export const MEDIA_MAX_FILES = 3;
export const MEDIA_MAX_TOTAL_BYTES = 5 * 1024 * 1024; // 5 MB
export const MEDIA_PREVIEW_LIMIT = 3;

/**
 * Accepted MIME types — images only (PNG, JPG, WEBP).
 * Checked via exact match in media-upload.component.ts
 */
export const MEDIA_ALLOWED_TYPES: string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
];
