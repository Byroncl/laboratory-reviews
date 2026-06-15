import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/services/notification.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { PostsService } from '../../../posts/services/posts.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-bulk-post-upload',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './bulk-post-upload.component.html',
  styleUrl: './bulk-post-upload.component.scss'
})
export class BulkPostUploadComponent implements OnInit, OnDestroy {
  @Output() uploadComplete = new EventEmitter<void>();
  @Output() uploadCancelled = new EventEmitter<void>();

  isLoading = false;
  dragOver = false;
  selectedFile: File | null = null;
  uploadedPosts: any[] = [];
  showPreview = false;
  private destroy$ = new Subject<void>();

  constructor(
    private postsService: PostsService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    // Component initialization if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
      this.notificationService.toast(
        this.i18n.translate('dashboard.posts.invalidFileFormat'),
        'error'
      );
      return;
    }

    this.selectedFile = file;
    this.parseFile(file);
  }

  private parseFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const content = event.target?.result as string;

        if (file.name.endsWith('.json')) {
          this.uploadedPosts = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          this.uploadedPosts = this.parseCSV(content);
        }

        if (!Array.isArray(this.uploadedPosts) || this.uploadedPosts.length === 0) {
          throw new Error('Invalid format: must be an array of posts');
        }

        this.showPreview = true;
        this.notificationService.toast(
          this.i18n.translate('dashboard.posts.fileLoaded').replace('{count}', this.uploadedPosts.length.toString()),
          'success'
        );
      } catch (error: any) {
        this.notificationService.toast(
          error.message || this.i18n.translate('dashboard.posts.parseError'),
          'error'
        );
        this.selectedFile = null;
        this.uploadedPosts = [];
      }
    };

    reader.readAsText(file);
  }

  private parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const posts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const post: any = {};

      headers.forEach((header, index) => {
        post[header] = values[index] || '';
      });

      if (post.title && post.content) {
        posts.push(post);
      }
    }

    return posts;
  }

  onUpload(): void {
    if (!this.uploadedPosts || this.uploadedPosts.length === 0) {
      this.notificationService.toast(
        this.i18n.translate('dashboard.posts.noPostsToUpload'),
        'error'
      );
      return;
    }

    this.isLoading = true;

    this.postsService
      .bulkCreatePosts(this.uploadedPosts)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.toast(
            this.i18n.translate('dashboard.posts.bulkUploadSuccess').replace('{count}', this.uploadedPosts.length.toString()),
            'success'
          );
          this.uploadComplete.emit();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.notificationService.toast(
            error?.message || this.i18n.translate('dashboard.posts.bulkUploadError'),
            'error'
          );
        }
      });
  }

  onCancel(): void {
    this.selectedFile = null;
    this.uploadedPosts = [];
    this.showPreview = false;
    this.uploadCancelled.emit();
  }

  getPostPreview(post: any): string {
    return `${post.title || 'N/A'} - ${(post.content || 'N/A').substring(0, 50)}...`;
  }
}
