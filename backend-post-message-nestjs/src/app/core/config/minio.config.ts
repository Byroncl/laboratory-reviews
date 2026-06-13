import { Client } from 'minio';

export const createMinioClient = (): Client => {
  return new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });
};

export const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || 'posts';
