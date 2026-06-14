import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly apiUrl = '/api/favorites';

  constructor(private http: HttpClient) {}

  getMyFavorites(page = 1, limit = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  addFavorite(postId: string): Observable<any> {
    return this.http.post(this.apiUrl, { postId });
  }

  removeFavorite(postId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  checkFavorite(postId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/check/${postId}`);
  }
}
