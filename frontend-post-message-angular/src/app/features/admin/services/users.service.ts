import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { User, CreateUserDto, UpdateUserDto, ChangePasswordDto, UserStats, UsersPaginatedResponse } from '../../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  readonly users$ = signal<User[]>([]);
  readonly loading$ = signal<boolean>(false);
  readonly error$ = signal<string | null>(null);
  readonly stats$ = signal<UserStats | null>(null);

  readonly pagination = signal<{ skip: number; limit: number; total: number }>({
    skip: 0,
    limit: 10,
    total: 0,
  });

  readonly totalUsers = computed(() => this.pagination().total || this.users$().length);
  readonly totalPages = computed(() => {
    const { limit, total } = this.pagination();
    if (!total) return 1;
    return Math.ceil(total / limit);
  });

  readonly currentPage = computed(() => {
    const { skip, limit } = this.pagination();
    return Math.floor(skip / limit) + 1;
  });

  constructor(private api: ApiService) {
    console.log('[UsersService] initialized');
  }

  private userId(user: User): string {
    return (user._id ?? user.id) as string;
  }

  loadUsers(
    skip: number = 0,
    limit: number = 10,
    filters?: { role?: string; status?: string; email?: string }
  ): Observable<UsersPaginatedResponse> {
    console.log('[UsersService] loadUsers', { skip, limit, filters });
    this.loading$.set(true);
    this.error$.set(null);

    const params: Record<string, unknown> = { skip, limit };
    if (filters?.role) params['role'] = filters.role;
    if (filters?.status) params['status'] = filters.status;
    if (filters?.email) params['email'] = filters.email;

    return this.api.get<UsersPaginatedResponse>('/users', params).pipe(
      tap(response => {
        const { items, total, skip: responseSkip, limit: responseLimit } = response.data;
        this.users$.set(items ?? []);
        this.pagination.set({
          skip: responseSkip ?? skip,
          limit: responseLimit ?? limit,
          total: total ?? 0
        });
        this.loading$.set(false);
        console.log('[UsersService] loadUsers success', { count: this.users$().length, total });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to load users';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[UsersService] loadUsers error', err);
        return throwError(() => err);
      })
    );
  }

  createUser(dto: CreateUserDto): Observable<{ data: User; message: string }> {
    console.log('[UsersService] createUser', dto);
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.post<{ data: User; message: string }>('/users', dto).pipe(
      tap(response => {
        this.users$.set([response.data, ...this.users$()]);
        this.loading$.set(false);
        console.log('[UsersService] createUser success', response.data);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to create user';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[UsersService] createUser error', err);
        return throwError(() => err);
      })
    );
  }

  updateUser(id: string, dto: UpdateUserDto): Observable<{ data: User; message: string }> {
    console.log('[UsersService] updateUser', { id, dto });
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<{ data: User; message: string }>(`/users/${id}`, dto).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.users$().findIndex(u => this.userId(u) === id);
        if (index !== -1) {
          const users = [...this.users$()];
          users[index] = updated;
          this.users$.set(users);
        }
        this.loading$.set(false);
        console.log('[UsersService] updateUser success', updated);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to update user';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[UsersService] updateUser error', err);
        return throwError(() => err);
      })
    );
  }

  deleteUser(id: string): Observable<{ message: string }> {
    console.log('[UsersService] deleteUser', { id });
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.delete<{ message: string }>(`/users/${id}`).pipe(
      tap(() => {
        this.users$.set(this.users$().filter(u => this.userId(u) !== id));
        this.loading$.set(false);
        console.log('[UsersService] deleteUser success', { id });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to delete user';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[UsersService] deleteUser error', err);
        return throwError(() => err);
      })
    );
  }

  assignRole(userId: string, roleId: string): Observable<{ data: User; message: string }> {
    console.log('[UsersService] assignRole', { userId, roleId });
    return this.api.put<{ data: User; message: string }>(`/users/${userId}/role`, { roleId }).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.users$().findIndex(u => this.userId(u) === userId);
        if (index !== -1) {
          const users = [...this.users$()];
          users[index] = updated;
          this.users$.set(users);
        }
        console.log('[UsersService] assignRole success', updated);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to assign role';
        this.error$.set(errorMsg);
        console.error('[UsersService] assignRole error', err);
        return throwError(() => err);
      })
    );
  }

  changePassword(userId: string, dto: ChangePasswordDto): Observable<{ data: null; message: string }> {
    console.log('[UsersService] changePassword', { userId });
    return this.api.put<{ data: null; message: string }>(`/users/${userId}/password`, dto).pipe(
      catchError(err => {
        const errorMsg = err?.message || 'Failed to change password';
        this.error$.set(errorMsg);
        console.error('[UsersService] changePassword error', err);
        return throwError(() => err);
      })
    );
  }

  activateUser(id: string): Observable<{ data: User; message: string }> {
    console.log('[UsersService] activateUser', { id });
    return this.api.put<{ data: User; message: string }>(`/users/${id}/activate`, {}).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.users$().findIndex(u => this.userId(u) === id);
        if (index !== -1) {
          const users = [...this.users$()];
          users[index] = updated;
          this.users$.set(users);
        }
        console.log('[UsersService] activateUser success', updated);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to activate user';
        this.error$.set(errorMsg);
        console.error('[UsersService] activateUser error', err);
        return throwError(() => err);
      })
    );
  }

  deactivateUser(id: string): Observable<{ data: User; message: string }> {
    console.log('[UsersService] deactivateUser', { id });
    return this.api.put<{ data: User; message: string }>(`/users/${id}/deactivate`, {}).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.users$().findIndex(u => this.userId(u) === id);
        if (index !== -1) {
          const users = [...this.users$()];
          users[index] = updated;
          this.users$.set(users);
        }
        console.log('[UsersService] deactivateUser success', updated);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to deactivate user';
        this.error$.set(errorMsg);
        console.error('[UsersService] deactivateUser error', err);
        return throwError(() => err);
      })
    );
  }

  loadStats(): Observable<{ data: UserStats; message: string }> {
    console.log('[UsersService] loadStats');
    return this.api.get<{ data: UserStats; message: string }>('/users/stats/overview').pipe(
      tap(response => {
        this.stats$.set(response.data);
        console.log('[UsersService] loadStats success', response.data);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to load stats';
        this.error$.set(errorMsg);
        console.error('[UsersService] loadStats error', err);
        return throwError(() => err);
      })
    );
  }

  getProfile(): Observable<{ data: User; message: string }> {
    return this.api.get<{ data: User; message: string }>('/users/me/profile');
  }

  nextPage(): void {
    const { skip, limit, total } = this.pagination();
    const nextSkip = skip + limit;
    if (nextSkip < total) {
      this.loadUsers(nextSkip, limit).subscribe();
    }
  }

  prevPage(): void {
    const { skip, limit } = this.pagination();
    const prevSkip = Math.max(0, skip - limit);
    if (prevSkip !== skip) {
      this.loadUsers(prevSkip, limit).subscribe();
    }
  }
}
