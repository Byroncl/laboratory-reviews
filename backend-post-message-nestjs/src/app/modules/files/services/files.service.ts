import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { createMinioClient, MINIO_BUCKET } from '../../../core/config/minio.config';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly minioClient: Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    this.minioClient = createMinioClient();
    this.bucket = MINIO_BUCKET;
    this.publicUrl =
      process.env.MINIO_PUBLIC_URL ||
      `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000`;
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }> {
    await this.ensureBucketExists();

    const extension = file.originalname.split('.').pop() ?? 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    try {
      await this.minioClient.putObject(
        this.bucket,
        filename,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
    } catch (error) {
      this.logger.error(`Failed to upload image: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to upload image to storage');
    }

    return {
      url: this.getImageUrl(filename),
      filename,
    };
  }

  async deleteImage(filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucket, filename);
    } catch (error) {
      this.logger.warn(
        `Could not delete image "${filename}": ${(error as Error).message}`,
      );
    }
  }

  getImageUrl(filename: string): string {
    return `${this.publicUrl}/${this.bucket}/${filename}`;
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket "${this.bucket}" created`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure bucket exists: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException('Storage service unavailable');
    }
  }
}
