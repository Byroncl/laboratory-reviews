import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services';
import { ICreatePostDTO, IBulkCreateResponse } from '../../interfaces';
import { PostStatus } from '../../types';

interface ParseResult {
  valid: ICreatePostDTO[];
  invalidRows: Array<{ index: number; reason: string }>;
}

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css'],
})
export class BulkUploadComponent {
  private postsService = inject(PostsService);

  readonly isLoading = signal(false);
  readonly parseError = signal<string | null>(null);
  readonly invalidRows = signal<Array<{ index: number; reason: string }>>([]);
  readonly uploadResult = signal<IBulkCreateResponse | null>(null);
  readonly parsedCount = signal<number>(0);

  private parsedDtos: ICreatePostDTO[] = [];

  onFileSelected(event: Event): void {
    this.parseError.set(null);
    this.invalidRows.set([]);
    this.uploadResult.set(null);
    this.parsedDtos = [];
    this.parsedCount.set(0);

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.name.endsWith('.json')) {
      this.parseError.set('Only .json files are accepted.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this._parseJson(text);
    };
    reader.onerror = () => this.parseError.set('Failed to read file.');
    reader.readAsText(file);
  }

  onUpload(): void {
    if (this.parsedDtos.length === 0) return;

    this.isLoading.set(true);
    this.uploadResult.set(null);

    this.postsService.bulkCreatePosts(this.parsedDtos).subscribe({
      next: (result) => {
        this.uploadResult.set(result);
        this.isLoading.set(false);
        this.parsedDtos = [];
        this.parsedCount.set(0);
      },
      error: (err) => {
        this.parseError.set(err?.message ?? 'Upload failed.');
        this.isLoading.set(false);
      },
    });
  }

  get canUpload(): boolean {
    return this.parsedDtos.length > 0 && this.invalidRows().length === 0 && !this.isLoading();
  }

  private _parseJson(text: string): void {
    let raw: unknown;

    try {
      raw = JSON.parse(text);
    } catch {
      this.parseError.set('Invalid JSON. Please upload a valid JSON array.');
      return;
    }

    if (!Array.isArray(raw)) {
      this.parseError.set('JSON must be an array of post objects.');
      return;
    }

    const result = this._validateRows(raw);
    this.invalidRows.set(result.invalidRows);

    if (result.invalidRows.length === 0) {
      this.parsedDtos = result.valid;
      this.parsedCount.set(result.valid.length);
    } else {
      this.parsedDtos = [];
      this.parsedCount.set(0);
    }
  }

  private _validateRows(rows: unknown[]): ParseResult {
    const valid: ICreatePostDTO[] = [];
    const invalidRows: Array<{ index: number; reason: string }> = [];
    const validStatuses: PostStatus[] = ['draft', 'published', 'archived'];

    rows.forEach((row, i) => {
      if (!row || typeof row !== 'object') {
        invalidRows.push({ index: i + 1, reason: 'Row is not an object.' });
        return;
      }

      const obj = row as Record<string, unknown>;

      if (typeof obj['content'] !== 'string' || !obj['content'].trim()) {
        invalidRows.push({ index: i + 1, reason: 'Missing or empty "content" field.' });
        return;
      }

      if (obj['status'] !== undefined && !validStatuses.includes(obj['status'] as PostStatus)) {
        invalidRows.push({ index: i + 1, reason: `Invalid status "${obj['status']}". Must be draft, published, or archived.` });
        return;
      }

      if (obj['tags'] !== undefined) {
        if (!Array.isArray(obj['tags']) || !(obj['tags'] as unknown[]).every((t) => typeof t === 'string')) {
          invalidRows.push({ index: i + 1, reason: '"tags" must be an array of strings.' });
          return;
        }
      }

      const dto: ICreatePostDTO = {
        title: typeof obj['title'] === 'string' ? obj['title'].trim() : `Post ${i + 1}`,
        content: (obj['content'] as string).trim(),
      };

      if (obj['status']) dto.status = obj['status'] as PostStatus;
      if (Array.isArray(obj['tags'])) dto.tags = obj['tags'] as string[];

      valid.push(dto);
    });

    return { valid, invalidRows };
  }
}
