import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { FavoritesService } from '../../services/favorites.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';

@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './my-favorites.component.html',
  styleUrl: './my-favorites.component.scss',
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
