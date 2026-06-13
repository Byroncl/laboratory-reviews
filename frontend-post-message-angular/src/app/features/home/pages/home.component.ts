import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PostsService } from '../../posts/services/posts.service';
import { PostCardComponent } from '../components/post-card/post-card.component';
import { mapToPostViewModel, PostViewModel } from '../../../shared/models/post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-primary mb-6">Latest Posts</h1>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-gray-100 rounded-lg h-32 animate-pulse"></div>
          }
        </div>
      }

      @if (!loading() && loadError()) {
        <div data-cy="error-state" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p class="text-red-600 font-medium mb-3">Failed to load posts.</p>
          <button
            data-cy="retry-button"
            (click)="retry()"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition text-sm font-medium"
          >
            Retry
          </button>
        </div>
      }

      @if (!loading() && !loadError() && postViewModels().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <p class="text-lg">No posts yet.</p>
        </div>
      }

      @if (!loading() && !loadError() && postViewModels().length > 0) {
        <div class="grid gap-4">
          @for (post of postViewModels(); track post.id) {
            <app-post-card [post]="post" />
          }
        </div>
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly postsService = inject(PostsService);

  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly postViewModels = signal<PostViewModel[]>([]);

  /** Expose raw posts signal for tests */
  get posts() {
    return this.postsService.posts;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.postsService.loadPosts(0, 100).pipe(
      catchError(err => {
        this.loading.set(false);
        this.loadError.set(err?.message ?? 'Error loading posts');
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        const vms = this.postsService.posts().map(p => mapToPostViewModel(p));
        this.postViewModels.set(vms);
      }
      this.loading.set(false);
    });
  }

  retry(): void {
    this.loadData();
  }
}
