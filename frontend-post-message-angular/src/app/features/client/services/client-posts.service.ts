import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { CLIENT_ENDPOINTS, CLIENT_PAGINATION } from '../constants';
import { PostDto, CreatePostFormData, UpdatePostFormData, ApiResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ClientPostsService {
  constructor(private http: HttpClient) {}

  getMyPosts(page = 1, limit = CLIENT_PAGINATION.DEFAULT_PAGE_SIZE): Observable<ApiResponse<PostDto>> {
    return this.http
      .get<ApiResponse<PostDto>>(CLIENT_ENDPOINTS.POSTS.MY_POSTS, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching my posts:', error);
          return throwError(() => error);
        })
      );
  }

  getPostById(id: string): Observable<ApiResponse<PostDto>> {
    return this.http
      .get<ApiResponse<PostDto>>(CLIENT_ENDPOINTS.POSTS.GET_BY_ID(id))
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching post:', error);
          return throwError(() => error);
        })
      );
  }

  createPost(data: CreatePostFormData): Observable<ApiResponse<PostDto>> {
    return this.http
      .post<ApiResponse<PostDto>>(CLIENT_ENDPOINTS.POSTS.CREATE, data)
      .pipe(
        catchError(error => {
          console.error('Error creating post:', error);
          return throwError(() => error);
        })
      );
  }

  updatePost(id: string, data: Partial<UpdatePostFormData>): Observable<ApiResponse<PostDto>> {
    return this.http
      .put<ApiResponse<PostDto>>(CLIENT_ENDPOINTS.POSTS.UPDATE(id), data)
      .pipe(
        catchError(error => {
          console.error('Error updating post:', error);
          return throwError(() => error);
        })
      );
  }

  deletePost(id: string): Observable<void> {
    return this.http
      .delete<void>(CLIENT_ENDPOINTS.POSTS.DELETE(id))
      .pipe(
        catchError(error => {
          console.error('Error deleting post:', error);
          return throwError(() => error);
        })
      );
  }
}
