import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, retry, finalize } from 'rxjs/operators';

import {
  IPost,
  IPostListResponse,
  IPostResponse,
  IPagination,
  IPostFilters,
} from '../interfaces';
import { POSTS_PAGINATION_DEFAULTS, POSTS_API_ENDPOINTS } from '../constants';
import {
  calculateTotalPages,
  calculateCurrentPage,
  canGoToNextPage,
  canGoToPreviousPage,
  getNextPageSkip,
  getPreviousPageSkip,
  resetPagination,
} from '../utils/pagination.util';

@Injectable({
  providedIn: 'root',
})
export abstract class PostsBaseService<T extends { _id?: string; id?: string }> {
  protected http!: HttpClient;
  protected baseUrl: string = '';
  protected retryAttempts = 2;

  // Signal-based state management (matching admin-base.service pattern)
  public items$ = signal<T[]>([]);
  protected loading$ = signal(false);
  protected error$ = signal<string | null>(null);
  public pagination = signal<IPagination>({
    skip: POSTS_PAGINATION_DEFAULTS.SKIP,
    limit: POSTS_PAGINATION_DEFAULTS.LIMIT,
    total: 0,
  });

  // Computed properties for readonly access
  public totalItems = computed(() => this.pagination().total);
  public totalPages = computed(() =>
    calculateTotalPages(this.pagination().total, this.pagination().limit),
  );
  public currentPage = computed(() =>
    calculateCurrentPage(this.pagination().skip, this.pagination().limit),
  );
  public isLoading = computed(() => this.loading$());
  public hasError = computed(() => this.error$() !== null);

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Loads items from API with pagination
   */
  protected loadItems(filters?: IPostFilters): Observable<IPostListResponse> {
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
      .get<IPostListResponse>(`${this.baseUrl}${POSTS_API_ENDPOINTS.LIST}`, { params })
      .pipe(
        retry(this.retryAttempts),
        tap((response) => this._handleLoadSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to load items')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Creates a new item
   */
  protected createItem(data: Partial<T>): Observable<IPostResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.http
      .post<IPostResponse>(`${this.baseUrl}${POSTS_API_ENDPOINTS.CREATE}`, data)
      .pipe(
        retry(this.retryAttempts),
        tap((response) => this._handleCreateSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to create item')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Updates an existing item
   */
  protected updateItem(id: string, data: Partial<T>): Observable<IPostResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    const url = `${this.baseUrl}${POSTS_API_ENDPOINTS.UPDATE.replace(':id', id)}`;

    return this.http
      .put<IPostResponse>(url, data)
      .pipe(
        retry(this.retryAttempts),
        tap((response) => this._handleUpdateSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to update item')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Deletes an item
   */
  protected deleteItem(id: string): Observable<any> {
    this.loading$.set(true);
    this.error$.set(null);

    const url = `${this.baseUrl}${POSTS_API_ENDPOINTS.DELETE.replace(':id', id)}`;

    return this.http
      .delete<any>(url)
      .pipe(
        retry(this.retryAttempts),
        tap(() => this._handleDeleteSuccess(id)),
        catchError((err) => this._handleError(err, 'Failed to delete item')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Pagination: Move to next page
   */
  public nextPage(): void {
    if (canGoToNextPage(this.pagination())) {
      const newSkip = getNextPageSkip(this.pagination());
      this.pagination.set({ ...this.pagination(), skip: newSkip });
    }
  }

  /**
   * Pagination: Move to previous page
   */
  public prevPage(): void {
    if (canGoToPreviousPage(this.pagination())) {
      const newSkip = getPreviousPageSkip(this.pagination());
      this.pagination.set({ ...this.pagination(), skip: newSkip });
    }
  }

  /**
   * Pagination: Reset to first page
   */
  public resetPagination(limit: number = POSTS_PAGINATION_DEFAULTS.LIMIT): void {
    this.pagination.set(resetPagination(limit));
  }

  /**
   * Clears all items from state
   */
  public clearItems(): void {
    this.items$.set([]);
    this.resetPagination();
  }

  /**
   * Gets the ID from an entity (handles both _id and id)
   */
  protected _getId(entity: T | null | undefined): string | null {
    if (!entity) return null;
    return (entity._id || entity.id) as string | null;
  }

  /**
   * Builds query parameters for load request.
   * Override in subclass for custom filters.
   */
  protected _buildLoadParams(filters?: IPostFilters): Record<string, unknown> {
    return {
      skip: this.pagination().skip,
      limit: this.pagination().limit,
    };
  }

  /**
   * Handles successful load response
   */
  protected _handleLoadSuccess(response: IPostListResponse): void {
    this.items$.set(response.data as unknown as T[]);
    this.pagination.set({
      skip: response.pagination.skip,
      limit: response.pagination.limit,
      total: response.pagination.total,
    });
    this.error$.set(null);
  }

  /**
   * Handles successful create response
   */
  protected _handleCreateSuccess(response: IPostResponse): void {
    const newItem = response.data as unknown as T;
    this.items$.set([newItem, ...this.items$()]);

    const current = this.pagination();
    this.pagination.set({ ...current, total: current.total + 1 });
    this.error$.set(null);
  }

  /**
   * Handles successful update response
   */
  protected _handleUpdateSuccess(response: IPostResponse): void {
    const updatedItem = response.data as unknown as T;
    const updatedId = this._getId(updatedItem);

    if (!updatedId) return;

    const updatedItems = this.items$().map((item) => {
      const itemId = this._getId(item);
      return itemId === updatedId ? updatedItem : item;
    });

    this.items$.set(updatedItems);
    this.error$.set(null);
  }

  /**
   * Handles successful delete response
   */
  protected _handleDeleteSuccess(id: string): void {
    const filteredItems = this.items$().filter((item) => this._getId(item) !== id);
    this.items$.set(filteredItems);

    const current = this.pagination();
    this.pagination.set({ ...current, total: Math.max(0, current.total - 1) });
    this.error$.set(null);
  }

  /**
   * Centralized error handling (matching admin-base pattern)
   */
  protected _handleError(
    error: HttpErrorResponse | any,
    defaultMessage: string,
  ): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || defaultMessage;
    this.error$.set(errorMessage);
    console.error('[PostsBaseService Error]', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
