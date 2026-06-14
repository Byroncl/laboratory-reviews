import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FeaturedUser {
  id: string;
  name: string;
  avatar?: string;
  postCount: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FeaturedUsersService {
  constructor(private apiService: ApiService) {}

  getFeaturedUsers(limit: number = 5): Observable<FeaturedUser[]> {
    return this.apiService
      .get<ApiResponse<{ items: any[] }>>('/users', { skip: 0, limit: limit * 2 })
      .pipe(
        map(response => {
          const users = (response.data as any)?.items || [];
          return users
            .sort((a: any, b: any) => (b.postCount || 0) - (a.postCount || 0))
            .slice(0, limit)
            .map((user: any) => ({
              id: user.id,
              name: user.name || user.username,
              avatar: user.avatar,
              postCount: user.postCount || 0,
            }));
        }),
      );
  }
}
