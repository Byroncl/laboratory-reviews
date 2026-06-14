import { Component, OnInit, signal, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { PostsService } from '../../posts/services/posts.service';
import { PostCardComponent } from '../components/post-card/post-card.component';
import { HeaderComponent } from '../components/header/header.component';
import { mapToPostViewModel } from '../../../shared/models/post.model';
import { selectIsAuthenticated } from '../../auth/store/auth.selectors';
import { PostViewModel } from '../types';
import { filterPosts } from '../utils';
import { HOME_ROUTES, HOME_MESSAGES } from '../constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PostCardComponent, HeaderComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly messages = HOME_MESSAGES;
  readonly isAuthenticated = toSignal(this.store.select(selectIsAuthenticated), { initialValue: false });
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly postViewModels = signal<PostViewModel[]>([]);
  readonly searchQuery = signal('');

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
    this.router.navigate([HOME_ROUTES.LOGIN], { queryParams: { returnUrl: HOME_ROUTES.ROOT } });
  }

  navigateToDashboard(): void {
    this.router.navigate([HOME_ROUTES.DASHBOARD]);
  }
}
