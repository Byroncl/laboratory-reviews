import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Category {
  id: string;
  name: string;
  postCount?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private apiService: ApiService) {}

  getCategories(): Observable<Category[]> {
    return this.apiService
      .get<ApiResponse<{ items: any[] }>>('/categories')
      .pipe(
        map(response => {
          const items = (response.data as any)?.items || [];
          return items.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            postCount: cat.postCount || 0,
          }));
        }),
      );
  }
}
