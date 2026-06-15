import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserStats {
  postCount: number;
  commentCount: number;
  favoriteCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PostsResponse {
  items: Array<{ id: string; title: string; createdAt: string }>;
  total: number;
}

export interface CommentsResponse {
  items: Array<{
    id: string;
    content: string;
    userId: string;
    createdAt: string;
    user?: { name: string; avatar?: string };
  }>;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  getUserStats(): Observable<UserStats> {
    return new Observable(observer => {
      this.getMyPosts(0, 1).subscribe(posts => {
        this.getMyComments(0, 1).subscribe(comments => {
          this.getMyFavorites(0, 1).subscribe(favorites => {
            observer.next({
              postCount: posts.total,
              commentCount: comments.total,
              favoriteCount: favorites.total,
            });
            observer.complete();
          });
        });
      });
    });
  }

  getMyPosts(skip: number = 0, limit: number = 10): Observable<PostsResponse> {
    return this.apiService
      .get<ApiResponse<PostsResponse>>('/posts/my-posts', { skip, limit })
      .pipe(map(response => response.data));
  }

  getMyComments(skip: number = 0, limit: number = 10): Observable<CommentsResponse> {
    return this.apiService
      .get<ApiResponse<CommentsResponse>>('/comments/my-comments', { page: Math.floor(skip / limit) + 1, limit })
      .pipe(map(response => response.data));
  }

  getMyFavorites(skip: number = 0, limit: number = 10): Observable<{ items: any[]; total: number }> {
    return this.apiService
      .get<ApiResponse<{ items: any[]; total: number }>>('/favorites/my-favorites', { skip, limit })
      .pipe(
        map(response => response.data),
        map(data => ({
          items: data?.items || [],
          total: data?.total || 0,
        })),
      );
  }

  getRecentActivity(limit: number = 5): Observable<any[]> {
    return this.apiService
      .get<ApiResponse<any[]>>('/comments/my-comments', { limit })
      .pipe(
        map(response => {
          const comments = (response.data as any).items || [];
          return comments.slice(0, limit).map((comment: any) => ({
            id: comment.id,
            user: {
              name: comment.user?.name || 'Unknown User',
              avatar: comment.user?.avatar,
            },
            text: `commented: ${comment.content?.substring(0, 50)}...`,
            createdAt: new Date(comment.createdAt),
          }));
        }),
      );
  }
}
