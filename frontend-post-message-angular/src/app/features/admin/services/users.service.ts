import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { User, CreateUserDto, UpdateUserDto, ChangePasswordDto, UserStats, UsersPaginatedResponse } from '../../../shared/models/user.model';
import { AdminBaseService } from './admin-base.service';
import { ADMIN_ENDPOINTS, ADMIN_SUB_ENDPOINTS } from '../constants';

@Injectable({ providedIn: 'root' })
export class UsersService extends AdminBaseService<User> {
  readonly stats$ = signal<UserStats | null>(null);
  readonly users$ = this.items$; // Alias for consistency

  protected endpoint = ADMIN_ENDPOINTS.USERS;

  loadUsers(
    skip: number = 0,
    limit: number = 10,
    filters?: { role?: string; status?: string; email?: string }
  ): Observable<UsersPaginatedResponse> {
    const params = this._buildFilterParams(filters);
    return this.loadItems(skip, limit, params);
  }

  createUser(dto: CreateUserDto): Observable<{ data: User; message: string }> {
    return this.createItem(dto) as Observable<any>;
  }

  updateUser(id: string, dto: UpdateUserDto): Observable<{ data: User; message: string }> {
    return this.updateItem(id, dto) as Observable<any>;
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.deleteItem(id) as Observable<any>;
  }

  assignRole(userId: string, roleId: string): Observable<{ data: User; message: string }> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<{ data: User; message: string }>(
      `${this.endpoint}/${userId}/${ADMIN_SUB_ENDPOINTS.ROLE_ASSIGN}`,
      { roleId }
    ).pipe(
      tap(response => this._handleUpdateSuccess(response, userId)),
      catchError(err => this._handleError(err, 'Failed to assign role'))
    );
  }

  changePassword(userId: string, dto: ChangePasswordDto): Observable<{ data: null; message: string }> {
    return this.api.put<{ data: null; message: string }>(
      `${this.endpoint}/${userId}/${ADMIN_SUB_ENDPOINTS.PASSWORD}`,
      dto
    ).pipe(
      retry(this.retryAttempts),
      catchError(err => this._handleError(err, 'Failed to change password'))
    );
  }

  activateUser(id: string): Observable<{ data: User; message: string }> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<{ data: User; message: string }>(
      `${this.endpoint}/${id}/${ADMIN_SUB_ENDPOINTS.ACTIVATE}`,
      {}
    ).pipe(
      tap(response => this._handleUpdateSuccess(response, id)),
      catchError(err => this._handleError(err, 'Failed to activate user'))
    );
  }

  deactivateUser(id: string): Observable<{ data: User; message: string }> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<{ data: User; message: string }>(
      `${this.endpoint}/${id}/${ADMIN_SUB_ENDPOINTS.DEACTIVATE}`,
      {}
    ).pipe(
      tap(response => this._handleUpdateSuccess(response, id)),
      catchError(err => this._handleError(err, 'Failed to deactivate user'))
    );
  }

  loadStats(): Observable<{ data: UserStats; message: string }> {
    return this.api.get<{ data: UserStats; message: string }>(
      `${this.endpoint}/${ADMIN_SUB_ENDPOINTS.STATS}`
    ).pipe(
      tap(response => {
        this.stats$.set(response.data);
      }),
      catchError(err => this._handleError(err, 'Failed to load stats'))
    );
  }

  getProfile(): Observable<{ data: User; message: string }> {
    return this.api.get<{ data: User; message: string }>(
      `${this.endpoint}/${ADMIN_SUB_ENDPOINTS.PROFILE}`
    );
  }

  private _buildFilterParams(filters?: { role?: string; status?: string; email?: string }): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    if (filters?.role) params['role'] = filters.role;
    if (filters?.status) params['status'] = filters.status;
    if (filters?.email) params['email'] = filters.email;
    return params;
  }
}
