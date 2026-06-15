import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TrendingTag {
  id: string;
  name: string;
  count: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PostsResponse {
  items: Array<{
    id: string;
    tags?: string[];
    title: string;
  }>;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class TrendingService {
  constructor(private apiService: ApiService) {}

  getTrendingTags(limit: number = 5): Observable<TrendingTag[]> {
    return this.apiService
      .get<ApiResponse<PostsResponse>>('/posts', { skip: 0, limit: 100 })
      .pipe(
        map(response => {
          const posts = (response.data as any).items || [];
          const tagCounts = new Map<string, number>();

          posts.forEach((post: any) => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach((tag: string) => {
                const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
                tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
              });
            }
          });

          return Array.from(tagCounts.entries())
            .map(([name, count], index) => ({
              id: String(index + 1),
              name,
              count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        }),
      );
  }
}
