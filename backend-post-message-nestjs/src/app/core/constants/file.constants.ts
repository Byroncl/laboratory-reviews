export const FILE_CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_AUDIO_SIZE: 20 * 1024 * 1024, // 20MB
  /** @deprecated Use MAX_IMAGE_SIZE or MAX_AUDIO_SIZE */
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  ALLOWED_AUDIO_MIME_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'] as const,
  get ALLOWED_MIME_TYPES() {
    return [...this.ALLOWED_IMAGE_MIME_TYPES, ...this.ALLOWED_AUDIO_MIME_TYPES] as readonly string[];
  },
  BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'posts',
  TEMP_UPLOAD_DIR: '/tmp/uploads',
} as const;
