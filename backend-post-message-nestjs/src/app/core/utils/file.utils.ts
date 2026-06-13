import { FILE_CONFIG } from '../constants/file.constants';
import { MimeType } from '../types/file.types';

export class FileUtils {
  static getExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  static getMimeType(filename: string): MimeType {
    const ext = this.getExtension(filename).toLowerCase();
    const mimeMap: Record<string, MimeType> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeMap[ext] || 'application/octet-stream';
  }

  static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    const ext = this.getExtension(originalName);
    return `${timestamp}-${random}.${ext}`;
  }

  static isValidImage(mimeType: string): boolean {
    return (FILE_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(
      mimeType,
    );
  }

  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
