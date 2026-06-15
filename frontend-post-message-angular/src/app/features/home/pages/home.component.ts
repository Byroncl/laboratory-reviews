import { Component, OnInit, signal, inject, computed, DestroyRef, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { catchError, of, Subject } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { PostsService } from '../../posts/services/posts.service';
import { PostCardComponent } from '../components/post-card/post-card.component';
import { HeaderComponent } from '../components/header/header.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { mapToPostViewModel } from '../../../shared/models/post.model';
import { selectIsAuthenticated } from '../../auth/store/auth.selectors';
import { PostViewModel } from '../types';
import { filterPosts } from '../utils';
import { HOME_ROUTES } from '../constants';
import { CategoriesService, Category } from '../services/categories.service';
import { FeaturedUsersService, FeaturedUser } from '../services/featured-users.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PostCardComponent, HeaderComponent, TranslatePipe, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly postsService = inject(PostsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly featuredUsersService = inject(FeaturedUsersService);
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
  readonly featuredUsers = signal<FeaturedUser[]>([]);

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
    this.loadData();
    this.loadSidebarData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.postsService.loadPosts().pipe(
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

  private loadSidebarData(): void {
    this.categoriesService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: cats => this.categories.set(cats),
        error: () => this.categories.set([]),
      });

    if (this.isAuthenticated()) {
      this.featuredUsersService.getFeaturedUsers(5)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: users => this.featuredUsers.set(users),
          error: () => this.featuredUsers.set([]),
        });
    }
  }

  retry(): void {
    this.loadData();
  }

  navigateToLogin(): void {
    this.router.navigate([HOME_ROUTES.LOGIN], { queryParams: { returnUrl: HOME_ROUTES.ROOT } });
  }

  navigateToDashboard(): void {
    this.router.navigate([HOME_ROUTES.DASHBOARD]);
  }
}
