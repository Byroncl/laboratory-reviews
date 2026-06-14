import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, retry, finalize } from 'rxjs/operators';

import {
  IComment,
  ICreateCommentDTO,
  ICommentListResponse,
  ICommentResponse,
  ICommentFilters,
  IPagination,
} from '../interfaces';
import { COMMENTS_PAGINATION_DEFAULTS, COMMENTS_API_ENDPOINTS } from '../constants';
import { applyCommentFilters } from '../utils';
import { getCommentId } from '../utils/entity-id.util';
import {
  calculateTotalPages,
  calculateCurrentPage,
  resetPagination,
  canGoToNextPage,
  canGoToPreviousPage,
  getNextPageSkip,
  getPreviousPageSkip,
} from '../utils/pagination.util';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';
  private readonly retryAttempts = 2;

  // Signal-based state
  private readonly comments$ = signal<IComment[]>([]);
  private readonly loading$ = signal(false);
  private readonly error$ = signal<string | null>(null);
  private readonly pagination = signal<IPagination>({
    skip: COMMENTS_PAGINATION_DEFAULTS.SKIP,
    limit: COMMENTS_PAGINATION_DEFAULTS.LIMIT,
    total: 0,
  });
  private readonly filters = signal<ICommentFilters>({});

  // Public computed accessors
  public readonly comments = computed(() => this.comments$());
  public readonly isLoading = computed(() => this.loading$());
  public readonly hasError = computed(() => this.error$() !== null);
  public readonly errorMessage = computed(() => this.error$());
  public readonly pagination$ = computed(() => this.pagination());
  public readonly totalPages = computed(() =>
    calculateTotalPages(this.pagination().total, this.pagination().limit),
  );
  public readonly currentPage = computed(() =>
    calculateCurrentPage(this.pagination().skip, this.pagination().limit),
  );
  public readonly filteredComments = computed(() =>
    applyCommentFilters(this.comments$(), this.filters()),
  );

  /**
   * Load comments with optional filters
   */
  public loadComments(filters?: ICommentFilters): Observable<ICommentListResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    const rawParams = this._buildLoadParams(filters);
    let params = new HttpParams();
    for (const [key, value] of Object.entries(rawParams)) {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    }

    return this.http
      .get<ICommentListResponse>(`${this.baseUrl}${COMMENTS_API_ENDPOINTS.LIST}`, { params })
      .pipe(
        retry(this.retryAttempts),
        tap((response) => this._handleLoadSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to load comments')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Load comments scoped to a specific post
   */
  public loadCommentsByPost(
    postId: string,
    filters?: ICommentFilters,
  ): Observable<ICommentListResponse> {
    return this.loadComments({ ...filters, postId });
  }

  /**
   * Create a new comment
   */
  public createComment(data: ICreateCommentDTO): Observable<ICommentResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.http
      .post<ICommentResponse>(`${this.baseUrl}${COMMENTS_API_ENDPOINTS.CREATE}`, data)
      .pipe(
        retry(this.retryAttempts),
        tap((response) => this._handleCreateSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to create comment')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Update a comment
   */
  public updateComment(id: string, data: Partial<IComment>): Observable<ICommentResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    const url = `${this.baseUrl}${COMMENTS_API_ENDPOINTS.UPDATE.replace(':id', id)}`;

    return this.http
      .put<ICommentResponse>(url, data)
      .pipe(
        retry(this.retryAttempts),
        tap((response) => this._handleUpdateSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to update comment')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Delete a comment
   */
  public deleteComment(id: string): Observable<any> {
    this.loading$.set(true);
    this.error$.set(null);

    const url = `${this.baseUrl}${COMMENTS_API_ENDPOINTS.DELETE.replace(':id', id)}`;

    return this.http
      .delete<any>(url)
      .pipe(
        retry(this.retryAttempts),
        tap(() => this._handleDeleteSuccess(id)),
        catchError((err) => this._handleError(err, 'Failed to delete comment')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Create a reply to a comment
   */
  public replyToComment(
    commentId: string,
    data: Omit<ICreateCommentDTO, 'postId'>,
  ): Observable<ICommentResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    const url = `${this.baseUrl}${COMMENTS_API_ENDPOINTS.REPLIES.replace(':id', commentId)}`;

    return this.http
      .post<ICommentResponse>(url, data)
      .pipe(
        retry(this.retryAttempts),
        tap((response) => this._handleCreateSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to reply to comment')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Update the active filter state
   */
  public updateFilters(filters: ICommentFilters): void {
    this.filters.set(filters);
  }

  /**
   * Clear all active filters
   */
  public clearFilters(): void {
    this.filters.set({});
  }

  /**
   * Pagination: next page
   */
  public nextPage(): void {
    if (canGoToNextPage(this.pagination())) {
      const newSkip = getNextPageSkip(this.pagination());
      this.pagination.set({ ...this.pagination(), skip: newSkip });
    }
  }

  /**
   * Pagination: previous page
   */
  public prevPage(): void {
    if (canGoToPreviousPage(this.pagination())) {
      const newSkip = getPreviousPageSkip(this.pagination());
      this.pagination.set({ ...this.pagination(), skip: newSkip });
    }
  }

  /**
   * Clear all comments and reset pagination
   */
  public clearComments(): void {
    this.comments$.set([]);
    this.pagination.set(resetPagination(COMMENTS_PAGINATION_DEFAULTS.LIMIT));
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private _buildLoadParams(filters?: ICommentFilters): Record<string, unknown> {
    const params: Record<string, unknown> = {
      skip: this.pagination().skip,
      limit: this.pagination().limit,
    };

    if (filters?.searchTerm) params['search'] = filters.searchTerm;
    if (filters?.email) params['email'] = filters.email;
    if (filters?.postId) params['postId'] = filters.postId;
    if (filters?.dateFrom) params['dateFrom'] = filters.dateFrom.toISOString();
    if (filters?.dateTo) params['dateTo'] = filters.dateTo.toISOString();

    return params;
  }

  private _handleLoadSuccess(response: ICommentListResponse): void {
    this.comments$.set(response.data);
    this.pagination.set({
      skip: response.pagination.skip,
      limit: response.pagination.limit,
      total: response.pagination.total,
    });
    this.error$.set(null);
  }

  private _handleCreateSuccess(response: ICommentResponse): void {
    this.comments$.set([response.data, ...this.comments$()]);
    const current = this.pagination();
    this.pagination.set({ ...current, total: current.total + 1 });
    this.error$.set(null);
  }

  private _handleUpdateSuccess(response: ICommentResponse): void {
    const updatedComment = response.data;
    const updatedId = getCommentId(updatedComment);

    if (!updatedId) return;

    const updatedComments = this.comments$().map((comment) =>
      getCommentId(comment) === updatedId ? updatedComment : comment,
    );

    this.comments$.set(updatedComments);
    this.error$.set(null);
  }

  private _handleDeleteSuccess(id: string): void {
    const filtered = this.comments$().filter(
      (comment) => getCommentId(comment) !== id,
    );
    this.comments$.set(filtered);

    const current = this.pagination();
    this.pagination.set({ ...current, total: Math.max(0, current.total - 1) });
    this.error$.set(null);
  }

  private _handleError(error: any, defaultMessage: string): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || defaultMessage;
    this.error$.set(errorMessage);
    console.error('[CommentsService Error]', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
