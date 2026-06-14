import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { CLIENT_ENDPOINTS, CLIENT_PAGINATION } from '../constants';
import { FavoriteDto, ApiResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  constructor(private http: HttpClient) {}

  getMyFavorites(page = 1, limit = CLIENT_PAGINATION.DEFAULT_PAGE_SIZE): Observable<ApiResponse<FavoriteDto>> {
    return this.http
      .get<ApiResponse<FavoriteDto>>(CLIENT_ENDPOINTS.FAVORITES.GET_MY_FAVORITES, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching favorites:', error);
          return throwError(() => error);
        })
      );
  }

  addFavorite(postId: string): Observable<ApiResponse<FavoriteDto>> {
    return this.http
      .post<ApiResponse<FavoriteDto>>(CLIENT_ENDPOINTS.FAVORITES.CREATE, { postId })
      .pipe(
        catchError(error => {
          console.error('Error adding favorite:', error);
          return throwError(() => error);
        })
      );
  }

  removeFavorite(postId: string): Observable<void> {
    return this.http
      .delete<void>(CLIENT_ENDPOINTS.FAVORITES.DELETE(postId))
      .pipe(
        catchError(error => {
          console.error('Error removing favorite:', error);
          return throwError(() => error);
        })
      );
  }

  checkFavorite(postId: string): Observable<ApiResponse<{ isFavorite: boolean }>> {
    return this.http
      .get<ApiResponse<{ isFavorite: boolean }>>(CLIENT_ENDPOINTS.FAVORITES.CHECK(postId))
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error checking favorite:', error);
          return throwError(() => error);
        })
      );
  }
}
