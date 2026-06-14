import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { CLIENT_ENDPOINTS, CLIENT_PAGINATION } from '../constants';
import { CommentDto, ApiResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ClientCommentsService {
  constructor(private http: HttpClient) {}

  getMyComments(page = 1, limit = CLIENT_PAGINATION.DEFAULT_PAGE_SIZE): Observable<ApiResponse<CommentDto>> {
    return this.http
      .get<ApiResponse<CommentDto>>(CLIENT_ENDPOINTS.COMMENTS.MY_COMMENTS, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching my comments:', error);
          return throwError(() => error);
        })
      );
  }

  createComment(postId: string, data: { name: string; email: string; body: string }): Observable<ApiResponse<CommentDto>> {
    return this.http
      .post<ApiResponse<CommentDto>>(CLIENT_ENDPOINTS.COMMENTS.CREATE, { ...data, postId })
      .pipe(
        catchError(error => {
          console.error('Error creating comment:', error);
          return throwError(() => error);
        })
      );
  }

  deleteComment(id: string): Observable<void> {
    return this.http
      .delete<void>(CLIENT_ENDPOINTS.COMMENTS.DELETE(id))
      .pipe(
        catchError(error => {
          console.error('Error deleting comment:', error);
          return throwError(() => error);
        })
      );
  }
}
