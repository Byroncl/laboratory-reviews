import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AdminBaseService } from './admin-base.service';

export interface Comment {
  _id?: string;
  id?: string;
  postId: string;
  userId: string;
  author?: string;
  content: string;
  mediaUrls?: string[];
  mediaTypes?: string[];
  mediaFilenames?: string[];
  isDeleted?: boolean;
  isActive?: boolean;
  parentCommentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  mediaUrls?: string[];
}

export interface UpdateCommentDto {
  content?: string;
  isActive?: boolean;
}

export interface CommentsPaginatedResponse {
  data: Comment[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class CommentsAdminService extends AdminBaseService<Comment> {
  readonly comments$ = this.items$;
  protected endpoint = '/comments';

  loadComments(skip: number = 0, limit: number = 10, filters?: { postId?: string; author?: string }): Observable<CommentsPaginatedResponse> {
    const params = filters ? { ...filters, skip, limit } : { skip, limit };
    return this.loadItems(skip, limit, params);
  }

  createComment(dto: CreateCommentDto): Observable<{ data: Comment; message: string }> {
    return this.createItem(dto as any) as Observable<any>;
  }

  updateComment(id: string, dto: UpdateCommentDto): Observable<{ data: Comment; message: string }> {
    return this.updateItem(id, dto as any) as Observable<any>;
  }

  deleteComment(id: string): Observable<{ message: string }> {
    return this.deleteItem(id) as Observable<any>;
  }

  toggleCommentStatus(id: string, isActive: boolean): Observable<{ data: Comment; message: string }> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<{ data: Comment; message: string }>(
      `${this.endpoint}/${id}`,
      { isActive }
    ).pipe(
      tap(response => this._handleUpdateSuccess(response, id)),
      catchError(err => this._handleError(err, 'Failed to update comment status'))
    );
  }

  getCommentsByPost(postId: string, skip: number = 0, limit: number = 10): Observable<CommentsPaginatedResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.get<CommentsPaginatedResponse>(
      this.endpoint,
      { postId, skip, limit }
    ).pipe(
      tap(response => {
        this.comments$.set(response.data || []);
        this.pagination.set({
          skip: response.skip || skip,
          limit: response.limit || limit,
          total: response.total || 0
        });
        this.loading$.set(false);
      }),
      catchError(err => this._handleError(err, 'Failed to load comments'))
    );
  }
}
