import { Client } from 'minio';

export const createMinioClient = (): Client => {
  const endpoint = process.env.MINIO_ENDPOINT || 'minio:9000';
  const port = endpoint.includes(':') ? undefined : 9000;

  return new Client({
    endPoint: endpoint.split(':')[0],
    port: port || parseInt(endpoint.split(':')[1]),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });
};

export const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || 'posts';
