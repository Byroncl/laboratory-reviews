import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { PostsService } from '../../services';
import { ICreatePostDTO, IBulkCreateResponse } from '../../interfaces';
import { PostStatus } from '../../types';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';

interface ParseResult {
  valid: ICreatePostDTO[];
  invalidRows: Array<{ index: number; reason: string }>;
}

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css'],
})
export class BulkUploadComponent {
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  @Output() uploadSuccess = new EventEmitter<void>();

  readonly isLoading = signal(false);
  readonly parseError = signal<string | null>(null);
  readonly invalidRows = signal<Array<{ index: number; reason: string }>>([]);
  readonly uploadResult = signal<IBulkCreateResponse | null>(null);
  readonly parsedCount = signal<number>(0);
  readonly showLoadingModal = signal(false);

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
    this.showLoadingModal.set(true);
    this.uploadResult.set(null);

    const author = this.authService.currentUser$()?.username || 'Anonymous';
    const postsWithAuthor = this.parsedDtos.map(post => {
      return {
        ...post,
        author
      };
    });

    console.log('Sending posts:', postsWithAuthor);
    this.postsService.bulkCreatePosts(postsWithAuthor as any).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        let created = 0;
        let failed = 0;

        // Handle different response formats
        if (response.created !== undefined && response.failed !== undefined) {
          // Expected format
          created = response.created;
          failed = response.failed;
        } else if (Array.isArray(response.data)) {
          // Backend returns array of created posts
          created = response.data.length;
          failed = 0;
        }

        const result = { created, failed, errors: response.errors || [] };
        this.uploadResult.set(result);
        const successMsg = failed === 0
          ? `✅ Successfully uploaded ${created} posts!`
          : `⚠️ Uploaded ${created} posts with ${failed} failures`;

        this.notificationService.toast(successMsg, failed === 0 ? 'success' : 'warning');

        setTimeout(() => {
          this.showLoadingModal.set(false);
          if (failed === 0) {
            this.uploadSuccess.emit();
            this.parsedDtos = [];
            this.parsedCount.set(0);
            this.uploadResult.set(null);
          }
        }, 800);
      },
      error: (err) => {
        this.parseError.set(err?.message ?? 'Upload failed.');
        this.notificationService.toast('❌ Upload failed: ' + (err?.message ?? 'Unknown error'), 'error');
        this.isLoading.set(false);
        this.showLoadingModal.set(false);
      },
    });
  }

  get canUpload(): boolean {
    return this.parsedDtos.length > 0 && this.invalidRows().length === 0 && !this.isLoading();
  }

  downloadFormatTemplate(): void {
    const template = [
      {
        title: 'My First Post',
        content: 'This is the content of my first post. It can be as long as needed.',
        status: 'draft',
        tags: ['angular', 'tutorial']
      },
      {
        title: 'Understanding TypeScript',
        content: 'TypeScript is a strongly typed programming language built on top of JavaScript. It adds optional static typing, which helps catch errors early.',
        status: 'published',
        tags: ['typescript', 'programming']
      }
    ];

    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'posts-format.json';
    link.click();
    URL.revokeObjectURL(url);
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
        body: (obj['content'] || obj['body'] as string).trim(),
        author: obj['author'] as string || 'Anonymous',
      };

      if (obj['status']) dto.status = obj['status'] as PostStatus;
      if (Array.isArray(obj['tags'])) dto.tags = obj['tags'] as string[];

      valid.push(dto);
    });

    return { valid, invalidRows };
  }
}
