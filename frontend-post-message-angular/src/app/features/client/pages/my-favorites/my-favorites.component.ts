import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { FavoritesService } from '../../services/favorites.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';

@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="my-favorites">
      <div class="header">
        <h2>Mis Favoritos</h2>
        <span class="count">{{ favorites().length }} favorito(s)</span>
      </div>

      <div class="loading" *ngIf="isLoading()">
        Cargando tus favoritos...
      </div>

      <div class="empty-state" *ngIf="!isLoading() && favorites().length === 0">
        <p>No tienes posts favoritos aún</p>
      </div>

      <div class="favorites-list" *ngIf="!isLoading() && favorites().length > 0">
        <app-post-card
          *ngFor="let fav of favorites()"
          [post]="fav.post || fav"
          [showFavorite]="true"
          [isFavorite]="true"
          (toggleFavorite)="onRemoveFavorite($event)"
        ></app-post-card>
      </div>

      <div class="pagination" *ngIf="totalPages() > 1">
        <button
          class="btn btn-small"
          [disabled]="currentPage() === 1"
          (click)="previousPage()"
        >
          Anterior
        </button>
        <span class="page-info">
          Página {{ currentPage() }} de {{ totalPages() }}
        </span>
        <button
          class="btn btn-small"
          [disabled]="currentPage() === totalPages()"
          (click)="nextPage()"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .my-favorites {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
      }

      .count {
        background-color: #e9ecef;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        color: #495057;
      }

      .loading {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .favorites-list {
        margin-bottom: 24px;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 24px;
      }

      .page-info {
        color: #666;
        font-size: 14px;
      }

      .btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        background-color: #007bff;
        color: white;
      }

      .btn:hover:not(:disabled) {
        background-color: #0056b3;
      }

      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .btn-small {
        padding: 6px 12px;
      }
    `,
  ],
})
export class MyFavoritesComponent implements OnInit {
  favorites = signal<any[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  totalFavorites = signal(0);

  totalPages = computed(() => Math.ceil(this.totalFavorites() / this.pageSize()));

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.favoritesService.getMyFavorites(this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        this.favorites.set(response.data?.data || []);
        this.totalFavorites.set(response.data?.total || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onRemoveFavorite(postId: string): void {
    this.favoritesService.removeFavorite(postId).subscribe({
      next: () => {
        this.loadFavorites();
      },
    });
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadFavorites();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadFavorites();
    }
  }
}
