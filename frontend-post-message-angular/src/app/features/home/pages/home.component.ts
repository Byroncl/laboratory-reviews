import { Component, OnInit, signal, inject, computed, DestroyRef, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { catchError, of, Subject } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { PostsService } from '../../posts/services/posts.service';
import { FavoritesService } from '../../posts/services/favorites.service';
import { PostCardComponent } from '../components/post-card/post-card.component';
import { HeaderComponent } from '../components/header/header.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { mapToPostViewModel } from '../../../shared/models/post.model';
import { selectIsAuthenticated } from '../../auth/store/auth.selectors';
import { PostViewModel } from '../types';
import { filterPosts } from '../utils';
import { HOME_ROUTES } from '../constants';
import { CategoriesService, Category } from '../services/categories.service';
import { FeaturedUser } from '../services/featured-users.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PostCardComponent, HeaderComponent, TranslatePipe, DatePipe, PaginationComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  public readonly postsService = inject(PostsService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();

  readonly isAuthenticated = toSignal(this.store.select(selectIsAuthenticated), { initialValue: false });
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly postViewModels = signal<PostViewModel[]>([]);
  readonly searchQuery = signal('');
  readonly categories = signal<Category[]>([]);
  readonly selectedCategoryId = signal<string | null>(null);

  readonly currentPage = signal<number>(1);
  readonly postsLimit = 9;

  readonly totalPages = computed(() => {
    const total = this.postsService.pagination$().total;
    return Math.ceil(total / this.postsLimit) || 1;
  });

  readonly featuredUsers = computed<FeaturedUser[]>(() => {
    const posts = this.postViewModels();
    const uniqueAuthors = new Map<string, number>();
    for (const post of posts) {
      const author = post.authorUsername;
      uniqueAuthors.set(author, (uniqueAuthors.get(author) || 0) + 1);
    }
    return Array.from(uniqueAuthors.entries())
      .slice(0, 3)
      .map(([username, count], idx) => ({
        id: `u-${idx}`,
        name: username,
        postCount: count,
      }));
  });

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  readonly filteredPosts = computed(() =>
    filterPosts(this.postViewModels(), this.searchQuery())
  );

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
    // Load favorites only if authenticated
    if (this.isAuthenticated()) {
      this.favoritesService.loadFavorites().pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      ).subscribe();
    }
    this.loadData();
    this.loadSidebarData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(categoryId?: string | null, page: number = 1): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.currentPage.set(page);
    const skip = (page - 1) * this.postsLimit;
    const filter = {
      status: 'published' as any,
      limit: this.postsLimit,
      skip,
      ...(categoryId && { categoryId }),
    };
    this.postsService.loadPosts(filter).pipe(
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

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
    this.loadData(categoryId, 1);
  }

  onPageChanged(page: number): void {
    this.loadData(this.selectedCategoryId(), page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadSidebarData(): void {
    this.categoriesService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: cats => this.categories.set(cats),
        error: () => this.categories.set([]),
      });
  }

  retry(): void {
    this.loadData(this.selectedCategoryId(), this.currentPage());
  }

  navigateToLogin(): void {
    this.router.navigate([HOME_ROUTES.LOGIN], { queryParams: { returnUrl: HOME_ROUTES.ROOT } });
  }

  navigateToDashboard(): void {
    this.router.navigate([HOME_ROUTES.DASHBOARD]);
  }
}
