import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { FileUploadResponse, FileUploadResult, FilesUploadResult } from '../../shared/models/file.model';

@Injectable({ providedIn: 'root' })
export class FilesService {
  readonly loading$ = signal<boolean>(false);
  readonly error$ = signal<string | null>(null);
  readonly uploadProgress$ = signal<number>(0);

  constructor(private api: ApiService) {
    console.log('[FilesService] initialized');
  }

  uploadFile(file: File): Observable<FileUploadResult> {
    console.log('[FilesService] uploadFile', { filename: file.name, size: file.size });
    this.loading$.set(true);
    this.error$.set(null);
    this.uploadProgress$.set(0);

    const formData = new FormData();
    formData.append('file', file);

    return this.api.post<FileUploadResult>('/files/upload', formData).pipe(
      tap(response => {
        this.loading$.set(false);
        this.uploadProgress$.set(100);
        console.log('[FilesService] uploadFile success', response.data);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to upload file';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[FilesService] uploadFile error', err);
        return throwError(() => err);
      })
    );
  }

  uploadFiles(files: File[]): Observable<FilesUploadResult> {
    console.log('[FilesService] uploadFiles', { count: files.length });
    this.loading$.set(true);
    this.error$.set(null);
    this.uploadProgress$.set(0);

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
      console.log('[FilesService] uploading file', { index, filename: file.name });
    });

    return this.api.post<FilesUploadResult>('/files/upload-multiple', formData).pipe(
      tap(response => {
        this.loading$.set(false);
        this.uploadProgress$.set(100);
        console.log('[FilesService] uploadFiles success', { count: response.data.length });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to upload files';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[FilesService] uploadFiles error', err);
        return throwError(() => err);
      })
    );
  }

  resetProgress(): void {
    this.uploadProgress$.set(0);
    this.error$.set(null);
  }
}
