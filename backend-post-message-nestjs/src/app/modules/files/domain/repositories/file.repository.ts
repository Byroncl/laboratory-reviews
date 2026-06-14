import { FileUploadResponse } from '../../../../core/interfaces/file.interface';

/**
 * Abstract repository for file operations.
 * Defines the contract for file storage and retrieval operations.
 */
export abstract class FileRepository {
  /**
   * Upload an image file to storage.
   * @param file - The file to upload
   * @returns Upload response with URL and filename
   * @throws InternalServerErrorException if upload fails
   */
  abstract uploadImage(
    file: Express.Multer.File,
  ): Promise<FileUploadResponse>;

  /**
   * Delete an image file from storage.
   * @param filename - The filename to delete
   * @throws Logs warning if deletion fails but doesn't throw
   */
  abstract deleteImage(filename: string): Promise<void>;

  /**
   * Get the full URL for an image file.
   * @param filename - The filename
   * @returns Full URL to the file
   */
  abstract getImageUrl(filename: string): string;
}
