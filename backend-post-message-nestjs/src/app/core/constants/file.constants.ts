export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'posts',
  TEMP_UPLOAD_DIR: '/tmp/uploads',
} as const;
