import { Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

import { FavoritesService } from '../../services/favorites.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';

import { CLIENT_MESSAGES } from '../../constants';
import { canGoToNextPage, canGoToPreviousPage } from '../../utils/pagination.utils';

@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [PostCardComponent, TranslatePipe],
  templateUrl: './my-favorites.component.html',
  styleUrl: './my-favorites.component.scss',
})
export class MyFavoritesComponent {
  private readonly favoritesService = inject(FavoritesService);

  readonly currentPage$ = signal(1);
  readonly pageSize$ = signal(10);
  readonly isLoading$ = signal(false);
  readonly error$ = signal<string | null>(null);
  readonly favorites$ = signal<any[]>([]);
  readonly totalFavorites$ = signal(0);

  readonly totalPages = computed(() =>
    Math.ceil(this.totalFavorites$() / this.pageSize$())
  );

  readonly canGoNext = computed(() =>
    canGoToNextPage(this.currentPage$(), this.totalPages())
  );

  readonly canGoPrevious = computed(() =>
    canGoToPreviousPage(this.currentPage$())
  );

  readonly messages = CLIENT_MESSAGES.MY_FAVORITES;

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    this.isLoading$.set(true);
    this.error$.set(null);

    this.favoritesService
      .getMyFavorites(this.currentPage$(), this.pageSize$())
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response: any) => {
          this.favorites$.set(response.data?.data || response.data || []);
          this.totalFavorites$.set(response.data?.total || 0);
          this.isLoading$.set(false);
        },
        error: () => {
          this.error$.set('Error loading favorites');
          this.isLoading$.set(false);
        },
      });
  }

  onRemoveFavorite(postId: string): void {
    this.favoritesService
      .removeFavorite(postId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.loadFavorites(),
        error: () => {
          this.error$.set('Error removing favorite');
        },
      });
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage$.update(p => p - 1);
      this.loadFavorites();
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage$.update(p => p + 1);
      this.loadFavorites();
    }
  }
}
