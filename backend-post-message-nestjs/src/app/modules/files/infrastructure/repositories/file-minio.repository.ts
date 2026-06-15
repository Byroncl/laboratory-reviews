import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Client } from 'minio';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileUploadResponse } from '../../../../core/interfaces/file.interface';
import { FileUtils } from '../../../../core/utils/file.utils';
import { I18nService } from '../../../../core/i18n/i18n.service';
import {
  createMinioClient,
  MINIO_BUCKET,
} from '../../../../core/config/minio.config';

/**
 * Concrete implementation of FileRepository using MinIO.
 * Handles file upload, deletion, and URL generation for images.
 */
@Injectable()
export class FileMinioRepository implements FileRepository {
  private readonly logger = new Logger(FileMinioRepository.name);
  private readonly minioClient: Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly i18nService: I18nService) {
    this.minioClient = createMinioClient();
    this.bucket = MINIO_BUCKET;
    this.publicUrl =
      process.env.MINIO_PUBLIC_URL ||
      `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000`;
  }

  async uploadImage(file: Express.Multer.File): Promise<FileUploadResponse> {
    // Ensure bucket exists before uploading
    await this.ensureBucketExists();

    // Generate unique filename
    const filename = FileUtils.generateFileName(file.originalname);

    try {
      // Upload file to MinIO
      await this.minioClient.putObject(
        this.bucket,
        filename,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
    } catch (error) {
      this.logger.error(
        `${this.i18nService.translate('files.upload_failed')}: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException(
        this.i18nService.translate('files.upload_failed'),
      );
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
      // Log warning but don't throw - deletion failure shouldn't break the app
      this.logger.warn(
        `Could not delete image "${filename}": ${(error as Error).message}`,
      );
    }
  }

  getImageUrl(filename: string): string {
    return `${this.publicUrl}/${this.bucket}/${filename}`;
  }

  /**
   * Private helper: Ensure the MinIO bucket exists, create if needed
   */
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
      throw new InternalServerErrorException(
        this.i18nService.translate('common.internal_error'),
      );
    }
  }
}
