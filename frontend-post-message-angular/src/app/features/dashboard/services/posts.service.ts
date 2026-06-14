import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { DASHBOARD_ENDPOINTS } from '../constants';
import { Post, ApiResponse, PaginatedResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private http: HttpClient) {}

  getAllPosts(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Post>> {
    return this.http
      .get<PaginatedResponse<Post>>(DASHBOARD_ENDPOINTS.POSTS.GET_ALL, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching posts:', error);
          return throwError(() => error);
        })
      );
  }

  getPostById(id: string): Observable<ApiResponse<Post>> {
    return this.http
      .get<ApiResponse<Post>>(DASHBOARD_ENDPOINTS.POSTS.GET_BY_ID(id))
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching post:', error);
          return throwError(() => error);
        })
      );
  }

  createPost(data: Partial<Post>): Observable<ApiResponse<Post>> {
    return this.http
      .post<ApiResponse<Post>>(DASHBOARD_ENDPOINTS.POSTS.CREATE, data)
      .pipe(
        catchError(error => {
          console.error('Error creating post:', error);
          return throwError(() => error);
        })
      );
  }

  updatePost(id: string, data: Partial<Post>): Observable<ApiResponse<Post>> {
    return this.http
      .put<ApiResponse<Post>>(DASHBOARD_ENDPOINTS.POSTS.UPDATE(id), data)
      .pipe(
        catchError(error => {
          console.error('Error updating post:', error);
          return throwError(() => error);
        })
      );
  }

  deletePost(id: string): Observable<void> {
    return this.http
      .delete<void>(DASHBOARD_ENDPOINTS.POSTS.DELETE(id))
      .pipe(
        catchError(error => {
          console.error('Error deleting post:', error);
          return throwError(() => error);
        })
      );
  }
}
