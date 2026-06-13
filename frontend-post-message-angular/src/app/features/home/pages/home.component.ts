import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { PostsService } from '../../posts/services/posts.service';
import { PostCardComponent } from '../components/post-card/post-card.component';
import { HeaderComponent } from '../components/header/header.component';
import { mapToPostViewModel, PostViewModel } from '../../../shared/models/post.model';
import { selectIsAuthenticated } from '../../auth/store/auth.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, PostCardComponent, HeaderComponent],
  template: `
    <app-header />

    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Hero section -->
      <section data-cy="hero-section" class="mb-10 text-center">
        <h1 class="text-4xl font-bold text-primary mb-3">Discover</h1>
        <p class="text-gray-500 text-lg mb-6">
          Explore posts, join the conversation, and share your ideas.
        </p>
        @if (isAuthenticated$ | async) {
          <button
            data-cy="hero-cta"
            class="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-black transition"
            (click)="navigateToDashboard()"
          >
            Create Post
          </button>
        } @else {
          <button
            data-cy="hero-cta"
            class="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-black transition"
            (click)="navigateToLogin()"
          >
            Sign in to Comment
          </button>
        }
      </section>

      <!-- Posts feed -->
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
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
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

  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/' } });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
