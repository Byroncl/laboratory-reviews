export interface FileUploadResponse {
  url: string;
  filename: string;
}

export interface FileUploadResult {
  data: FileUploadResponse;
  message: string;
}

export interface FilesUploadResult {
  data: FileUploadResponse[];
  message: string;
}

export interface FileMetadata {
  url: string;
  filename: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}
