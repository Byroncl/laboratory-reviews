import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IFavorite } from '../interfaces';
import { FAVORITES_API_ENDPOINTS } from '../constants';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly baseUrl = `${environment.apiUrl}${FAVORITES_API_ENDPOINTS.LIST}`;
  private readonly http = inject(HttpClient);

  readonly favorites = signal<string[]>([]);

  loadFavorites(): Observable<{ data: IFavorite[] }> {
    return this.http.get<{ data: IFavorite[] }>(this.baseUrl).pipe(
      tap((response) => {
        const favoriteIds = response.data.map((fav) => fav.postId);
        this.favorites.set(favoriteIds);
      }),
    );
  }

  addFavorite(postId: string): Observable<IFavorite> {
    return this.http.post<IFavorite>(this.baseUrl, { postId }).pipe(
      tap(() => {
        const current = this.favorites();
        if (!current.includes(postId)) {
          this.favorites.set([...current, postId]);
        }
      }),
    );
  }

  removeFavorite(postId: string): Observable<void> {
    const url = `${this.baseUrl}/${postId}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.favorites.set(this.favorites().filter((id) => id !== postId));
      }),
    );
  }

  isFavorite(postId: string): boolean {
    return this.favorites().includes(postId);
  }
}
