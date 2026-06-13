export interface UploadedFileMetadata {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
}
