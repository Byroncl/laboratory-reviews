import { Injectable } from '@nestjs/common';
import { FileUploadResponse } from '../../../core/interfaces/file.interface';
import { FileRepository } from '../domain/repositories/file.repository';

/**
 * FilesService acts as an orchestrator that delegates to the repository.
 * All file storage operations are handled by the repository layer.
 */
@Injectable()
export class FilesService {
  constructor(private readonly fileRepository: FileRepository) {}

  /**
   * Upload an image file to storage.
   * @param file - The image file to upload
   * @returns Upload response with URL and filename
   */
  async uploadImage(file: Express.Multer.File): Promise<FileUploadResponse> {
    return this.fileRepository.uploadImage(file);
  }

  /**
   * Delete an image file from storage.
   * @param filename - The filename to delete
   */
  async deleteImage(filename: string): Promise<void> {
    return this.fileRepository.deleteImage(filename);
  }

  /**
   * Get the full URL for an image file.
   * @param filename - The filename
   * @returns Full URL to the file
   */
  getImageUrl(filename: string): string {
    return this.fileRepository.getImageUrl(filename);
  }
}
