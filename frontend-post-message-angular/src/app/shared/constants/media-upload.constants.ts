// TODO: keep in sync with backend validation
export const MEDIA_MAX_FILES = 3;
export const MEDIA_MAX_TOTAL_BYTES = 5 * 1024 * 1024; // 5 MB
export const MEDIA_PREVIEW_LIMIT = 3;

/**
 * Accepted MIME type prefixes/full types.
 * Checked via String.startsWith or exact match.
 */
export const MEDIA_ALLOWED_TYPES: string[] = [
  'image/',
  'video/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.oasis.opendocument',
];
