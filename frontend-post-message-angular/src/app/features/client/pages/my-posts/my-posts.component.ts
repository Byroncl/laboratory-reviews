import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

import { ClientPostsService } from '../../services/client-posts.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostFormComponent } from '../../components/post-form/post-form.component';
import { SearchFilterComponent, SearchFilters } from '../../../../shared/components/search-filter/search-filter.component';

import { CLIENT_MESSAGES } from '../../constants';
import { canGoToNextPage, canGoToPreviousPage } from '../../utils/pagination.utils';

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PostCardComponent,
    PostFormComponent,
    SearchFilterComponent,
    TranslatePipe,
  ],
  templateUrl: './my-posts.component.html',
  styleUrl: './my-posts.component.scss',
})
export class MyPostsComponent {
  private readonly postsService = inject(ClientPostsService);
  private readonly fb = inject(FormBuilder);

  readonly showForm$ = signal(false);
  readonly editingPostId$ = signal<string | null>(null);
  readonly currentPage$ = signal(1);
  readonly pageSize$ = signal(10);
  readonly isLoading$ = signal(false);
  readonly error$ = signal<string | null>(null);
  readonly posts$ = signal<any[]>([]);
  readonly totalPosts$ = signal(0);

  readonly currentEditingPost = computed(() => {
    const postId = this.editingPostId$();
    if (!postId) return null;
    return this.posts$().find(p => p._id === postId) ?? null;
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.totalPosts$() / this.pageSize$())
  );

  readonly canGoNext = computed(() =>
    canGoToNextPage(this.currentPage$(), this.totalPages())
  );

  readonly canGoPrevious = computed(() =>
    canGoToPreviousPage(this.currentPage$())
  );

  readonly messages = CLIENT_MESSAGES.MY_POSTS;

  constructor() {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.isLoading$.set(true);
    this.error$.set(null);

    this.postsService
      .getMyPosts(this.currentPage$(), this.pageSize$())
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response: any) => {
          this.posts$.set(response.data?.data || response.data || []);
          this.totalPosts$.set(response.data?.total || 0);
          this.isLoading$.set(false);
        },
        error: () => {
          this.error$.set('Error loading posts');
          this.isLoading$.set(false);
        },
      });
  }

  toggleCreateForm(): void {
    this.showForm$.update(v => !v);
    if (!this.showForm$()) {
      this.editingPostId$.set(null);
    }
  }

  onFormSubmitted(data: any): void {
    const postId = this.editingPostId$();

    if (postId) {
      this.postsService
        .updatePost(postId, data)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => {
            this.loadPosts();
            this.showForm$.set(false);
            this.editingPostId$.set(null);
          },
          error: () => {
            this.error$.set('Error updating post');
          },
        });
    } else {
      this.postsService
        .createPost(data)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => {
            this.loadPosts();
            this.showForm$.set(false);
          },
          error: () => {
            this.error$.set('Error creating post');
          },
        });
    }
  }

  onFormCancelled(): void {
    this.showForm$.set(false);
    this.editingPostId$.set(null);
  }

  onEditPost(postId: string): void {
    this.editingPostId$.set(postId);
    this.showForm$.set(true);
  }

  onDeletePost(postId: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postsService
        .deletePost(postId)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => this.loadPosts(),
          error: () => {
            this.error$.set('Error deleting post');
          },
        });
    }
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage$.update(p => p - 1);
      this.loadPosts();
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage$.update(p => p + 1);
      this.loadPosts();
    }
  }

  onFilterChange(_newFilters: SearchFilters): void {
    this.currentPage$.set(1);
    this.loadPosts();
  }
}
