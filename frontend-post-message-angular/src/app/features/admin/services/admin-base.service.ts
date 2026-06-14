import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { IPagination } from '../interfaces';

@Injectable({ providedIn: 'root' })
export abstract class AdminBaseService<T extends { _id?: any; id?: any }> {
  readonly items$ = signal<T[]>([]);
  readonly loading$ = signal<boolean>(false);
  readonly error$ = signal<string | null>(null);

  readonly pagination = signal<IPagination>({
    skip: 0,
    limit: 10,
    total: 0
  });

  readonly totalItems = computed(() => this.pagination().total || this.items$().length);
  readonly totalPages = computed(() => {
    const { limit, total } = this.pagination();
    if (!total) return 1;
    return Math.ceil(total / limit);
  });

  readonly currentPage = computed(() => {
    const { skip, limit } = this.pagination();
    return Math.floor(skip / limit) + 1;
  });

  protected abstract endpoint: string;
  protected retryAttempts = 2;

  constructor(protected api: ApiService) {}

  protected _getId(item: T): string {
    return (item._id ?? item.id) as string;
  }

  loadItems(skip: number = 0, limit: number = 10, params?: Record<string, unknown>): Observable<any> {
    this.loading$.set(true);
    this.error$.set(null);

    const queryParams: Record<string, unknown> = { skip, limit, ...params };

    return this.api.get<any>(this.endpoint, queryParams).pipe(
      retry(this.retryAttempts),
      tap(response => this._handleLoadSuccess(response, skip, limit)),
      catchError(err => this._handleError(err, 'Failed to load items'))
    );
  }

  createItem(dto: Partial<T>): Observable<any> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.post<any>(this.endpoint, dto).pipe(
      tap(response => this._handleCreateSuccess(response)),
      catchError(err => this._handleError(err, 'Failed to create item'))
    );
  }

  updateItem(id: string, dto: Partial<T>): Observable<any> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<any>(`${this.endpoint}/${id}`, dto).pipe(
      tap(response => this._handleUpdateSuccess(response, id)),
      catchError(err => this._handleError(err, 'Failed to update item'))
    );
  }

  deleteItem(id: string): Observable<any> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.delete<any>(`${this.endpoint}/${id}`).pipe(
      tap(() => this._handleDeleteSuccess(id)),
      catchError(err => this._handleError(err, 'Failed to delete item'))
    );
  }

  protected _handleLoadSuccess(response: any, skip: number, limit: number): void {
    const data = response.data || response;
    if (data && 'items' in data) {
      this.items$.set(data.items ?? []);
      this.pagination.set({
        skip,
        limit,
        total: data.total ?? 0
      });
    } else if (Array.isArray(data)) {
      this.items$.set(data);
      this.pagination.set({ skip, limit, total: data.length });
    }
    this.loading$.set(false);
  }

  protected _handleCreateSuccess(response: any): void {
    const item = response.data || response;
    this.items$.set([item, ...this.items$()]);
    this.loading$.set(false);
  }

  protected _handleUpdateSuccess(response: any, id: string): void {
    const updated = response.data || response;
    const index = this.items$().findIndex(i => this._getId(i) === id);
    if (index !== -1) {
      const items = [...this.items$()];
      items[index] = updated;
      this.items$.set(items);
    }
    this.loading$.set(false);
  }

  protected _handleDeleteSuccess(id: string): void {
    this.items$.set(this.items$().filter(i => this._getId(i) !== id));
    this.loading$.set(false);
  }

  protected _handleError(err: any, defaultMessage: string): Observable<never> {
    const errorMsg = err?.message || defaultMessage;
    this.error$.set(errorMsg);
    this.loading$.set(false);
    return throwError(() => err);
  }

  nextPage(): void {
    const { skip, limit, total } = this.pagination();
    const nextSkip = skip + limit;
    if (nextSkip < total) {
      this.loadItems(nextSkip, limit).subscribe();
    }
  }

  prevPage(): void {
    const { skip, limit } = this.pagination();
    const prevSkip = Math.max(0, skip - limit);
    if (prevSkip !== skip) {
      this.loadItems(prevSkip, limit).subscribe();
    }
  }

  resetPagination(): void {
    this.pagination.set({ skip: 0, limit: 10, total: 0 });
  }

  clearItems(): void {
    this.items$.set([]);
    this.error$.set(null);
  }
}
