export type MediaUploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface SelectedMedia {
  file: File;
  previewUrl?: string;
  type: string;
  status: MediaUploadStatus;
  url?: string;
  filename?: string;
}

/**
 * The shape emitted by MediaUploadComponent after files are uploaded.
 * Three parallel arrays, one entry per file.
 * CRITICAL: mediaTypes is captured from File.type at selection time — it is NOT
 * derived from the upload response (which only returns { url, filename }).
 */
export interface MediaUploadResult {
  mediaUrls: string[];
  mediaTypes: string[];
  mediaFilenames: string[];
}
