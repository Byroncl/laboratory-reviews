/**
 * Files module configuration constants
 */
export const FILES_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ],
} as const;

/**
 * Files module i18n message keys
 */
export const FILES_MESSAGES = {
  // Success messages
  UPLOADED: 'files.uploaded',
  DELETED: 'files.deleted',

  // Error messages
  UPLOAD_FAILED: 'files.upload_failed',
  INVALID_TYPE: 'files.invalid_type',
  TOO_LARGE: 'files.too_large',
  INVALID_AUDIO_TYPE: 'files.invalid_audio_type',
  AUDIO_TOO_LARGE: 'files.audio_too_large',
} as const;

/**
 * Files Validation Messages (i18n keys)
 */
export const FILES_VALIDATION_MESSAGES = {
  FILE_REQUIRED: 'files.validation_file_required',
  INVALID_FILE_TYPE: 'files.invalid_type',
  FILE_TOO_LARGE: 'files.too_large',
  INVALID_AUDIO_TYPE: 'files.invalid_audio_type',
  AUDIO_TOO_LARGE: 'files.audio_too_large',
} as const;

/**
 * Swagger documentation for files endpoints
 */
export const FILES_SWAGGER = {
  UPLOAD_IMAGE: {
    summary: 'Upload image file',
    description: 'Upload an image file (JPEG, PNG, WebP, GIF)',
  },
  UPLOAD_MULTIPLE: {
    summary: 'Upload multiple media files',
    description: 'Upload multiple files (images and audios)',
  },
  DELETE_IMAGE: {
    summary: 'Delete image file',
    description: 'Delete an image file from storage',
  },
  UPLOAD_AUDIO: {
    summary: 'Upload audio file',
    description: 'Upload an audio file (MP3, WAV, OGG, WebM, max 20MB)',
  },
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const FILES_EXAMPLES = {
  UPLOAD_RESPONSE: {
    url: 'http://localhost:9000/laboratory-reviews/files-2024-01-15-abc123xyz.jpg',
    filename: 'files-2024-01-15-abc123xyz.jpg',
  },
  ERROR_UPLOAD_FAILED: {
    statusCode: 500,
    message: 'File upload failed',
    error: 'Internal Server Error',
  },
  ERROR_INVALID_TYPE: {
    statusCode: 400,
    message: 'Invalid file type',
    error: 'Bad Request',
  },
} as const;

/**
 * API Response Descriptions
 */
export const FILES_RESPONSE_DESCRIPTIONS = {
  UPLOADED: 'File uploaded successfully',
  MULTIPLE_UPLOADED: 'Files uploaded successfully',
  DELETED: 'File deleted successfully',
  UPLOAD_FAILED: 'File upload failed',
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized',
} as const;

/**
 * API Parameter Descriptions
 */
export const FILES_PARAM_DESCRIPTIONS = {
  FILE: 'File to upload (multipart form data)',
  FILES: 'Multiple files to upload (multipart form data)',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const FILES_DTO_DESCRIPTIONS = {
  FILE: 'The image file to upload (JPEG, PNG, WebP, or GIF)',
  AUDIO_FILE: 'The audio file to upload (MP3, WAV, OGG, or WebM, max 20MB)',
  FILENAME: 'Original filename of the uploaded file',
  URL: 'Public URL to access the uploaded file',
} as const;
