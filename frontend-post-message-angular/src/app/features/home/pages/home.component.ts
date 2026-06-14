import { Component, OnInit, signal, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { PostsService } from '../../posts/services/posts.service';
import { PostCardComponent } from '../components/post-card/post-card.component';
import { HeaderComponent } from '../components/header/header.component';
import { mapToPostViewModel, PostViewModel } from '../../../shared/models/post.model';
import { selectIsAuthenticated } from '../../auth/store/auth.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, ReactiveFormsModule, PostCardComponent, HeaderComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly postViewModels = signal<PostViewModel[]>([]);
  readonly searchQuery = signal('');

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  readonly filteredPosts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.postViewModels();
    return this.postViewModels().filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.preview.toLowerCase().includes(query)
    );
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.searchQuery.set(value ?? ''));
  }

  /** Expose raw posts signal for tests */
  get posts() {
    return this.postsService.posts$();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.postsService.loadPosts().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        this.loading.set(false);
        this.loadError.set(err?.message ?? 'Error loading posts');
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        const vms = this.postsService.posts$().map(p => mapToPostViewModel(p));
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
