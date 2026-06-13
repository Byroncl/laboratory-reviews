import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { createMinioClient, MINIO_BUCKET } from '../../../core/config/minio.config';
import { FileUploadResponse } from '../../../core/interfaces/file.interface';
import { FileUtils } from '../../../core/utils/file.utils';
import { TranslationService } from '../../../core/utils/translation.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly minioClient: Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly i18n: TranslationService) {
    this.minioClient = createMinioClient();
    this.bucket = MINIO_BUCKET;
    this.publicUrl =
      process.env.MINIO_PUBLIC_URL ||
      `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000`;
  }

  async uploadImage(file: Express.Multer.File): Promise<FileUploadResponse> {
    await this.ensureBucketExists();

    const filename = FileUtils.generateFileName(file.originalname);

    try {
      await this.minioClient.putObject(
        this.bucket,
        filename,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
    } catch (error) {
      this.logger.error(`${this.i18n.translate('files.upload_failed')}: ${(error as Error).message}`);
      throw new InternalServerErrorException(this.i18n.translate('files.upload_failed'));
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
      throw new InternalServerErrorException(this.i18n.translate('common.internal_error'));
    }
  }
}
