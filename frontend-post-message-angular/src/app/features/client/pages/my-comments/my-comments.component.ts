import { Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

import { ClientCommentsService } from '../../services/client-comments.service';
import { CommentCardComponent } from '../../components/comment-card/comment-card.component';

import { CLIENT_MESSAGES } from '../../constants';
import { canGoToNextPage, canGoToPreviousPage } from '../../utils/pagination.utils';

@Component({
  selector: 'app-my-comments',
  standalone: true,
  imports: [CommentCardComponent, TranslatePipe],
  templateUrl: './my-comments.component.html',
  styleUrl: './my-comments.component.scss',
})
export class MyCommentsComponent {
  private readonly commentsService = inject(ClientCommentsService);

  readonly currentPage$ = signal(1);
  readonly pageSize$ = signal(10);
  readonly isLoading$ = signal(false);
  readonly error$ = signal<string | null>(null);
  readonly comments$ = signal<any[]>([]);
  readonly totalComments$ = signal(0);

  readonly totalPages = computed(() =>
    Math.ceil(this.totalComments$() / this.pageSize$())
  );

  readonly canGoNext = computed(() =>
    canGoToNextPage(this.currentPage$(), this.totalPages())
  );

  readonly canGoPrevious = computed(() =>
    canGoToPreviousPage(this.currentPage$())
  );

  readonly messages = CLIENT_MESSAGES.MY_COMMENTS;

  constructor() {
    this.loadComments();
  }

  private loadComments(): void {
    this.isLoading$.set(true);
    this.error$.set(null);

    this.commentsService
      .getMyComments(this.currentPage$(), this.pageSize$())
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response: any) => {
          this.comments$.set(response.data?.data || response.data || []);
          this.totalComments$.set(response.data?.total || 0);
          this.isLoading$.set(false);
        },
        error: () => {
          this.error$.set('Error loading comments');
          this.isLoading$.set(false);
        },
      });
  }

  onDeleteComment(commentId: string): void {
    this.commentsService
      .deleteComment(commentId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.loadComments(),
        error: () => {
          this.error$.set('Error deleting comment');
        },
      });
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage$.update(p => p - 1);
      this.loadComments();
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage$.update(p => p + 1);
      this.loadComments();
    }
  }
}
