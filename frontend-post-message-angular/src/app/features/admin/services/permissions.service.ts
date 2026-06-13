import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Permission, CreatePermissionDto, UpdatePermissionDto, PermissionsPaginatedResponse } from '../../../shared/models/permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  readonly permissions$ = signal<Permission[]>([]);
  readonly permissions = this.permissions$; // Alias for consistency
  readonly loading$ = signal<boolean>(false);
  readonly error$ = signal<string | null>(null);

  readonly pagination = signal<{ skip: number; limit: number; total: number }>({
    skip: 0,
    limit: 10,
    total: 0,
  });

  readonly totalPermissions = computed(() => this.pagination().total || this.permissions$().length);
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
    console.log('[PermissionsService] initialized');
  }

  private permissionId(permission: Permission): string {
    return (permission._id ?? permission.id) as string;
  }

  loadPermissions(skip: number = 0, limit: number = 10): Observable<PermissionsPaginatedResponse> {
    console.log('[PermissionsService] loadPermissions', { skip, limit });
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.get<PermissionsPaginatedResponse>('/permissions', { skip, limit }).pipe(
      tap(response => {
        const data = response.data;
        if (data && 'items' in data) {
          this.permissions$.set(data.items ?? []);
          this.pagination.set({ skip, limit, total: data.total ?? 0 });
        } else {
          this.permissions$.set((data as Permission[]) ?? []);
          this.pagination.set({ skip, limit, total: ((data as Permission[]) ?? []).length });
        }
        this.loading$.set(false);
        console.log('[PermissionsService] loadPermissions success', { count: this.permissions$().length });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to load permissions';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[PermissionsService] loadPermissions error', err);
        return throwError(() => err);
      })
    );
  }

  createPermission(dto: CreatePermissionDto): Observable<{ data: Permission; message: string }> {
    console.log('[PermissionsService] createPermission', dto);
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.post<{ data: Permission; message: string }>('/permissions', dto).pipe(
      tap(response => {
        this.permissions$.set([response.data, ...this.permissions$()]);
        this.loading$.set(false);
        console.log('[PermissionsService] createPermission success', response.data);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to create permission';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[PermissionsService] createPermission error', err);
        return throwError(() => err);
      })
    );
  }

  updatePermission(id: string, dto: UpdatePermissionDto): Observable<{ data: Permission; message: string }> {
    console.log('[PermissionsService] updatePermission', { id, dto });
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<{ data: Permission; message: string }>(`/permissions/${id}`, dto).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.permissions$().findIndex(p => this.permissionId(p) === id);
        if (index !== -1) {
          const permissions = [...this.permissions$()];
          permissions[index] = updated;
          this.permissions$.set(permissions);
        }
        this.loading$.set(false);
        console.log('[PermissionsService] updatePermission success', updated);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to update permission';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[PermissionsService] updatePermission error', err);
        return throwError(() => err);
      })
    );
  }

  deletePermission(id: string): Observable<{ message: string }> {
    console.log('[PermissionsService] deletePermission', { id });
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.delete<{ message: string }>(`/permissions/${id}`).pipe(
      tap(() => {
        this.permissions$.set(this.permissions$().filter(p => this.permissionId(p) !== id));
        this.loading$.set(false);
        console.log('[PermissionsService] deletePermission success', { id });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to delete permission';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[PermissionsService] deletePermission error', err);
        return throwError(() => err);
      })
    );
  }

  nextPage(): void {
    const { skip, limit, total } = this.pagination();
    const nextSkip = skip + limit;
    if (nextSkip < total) {
      this.loadPermissions(nextSkip, limit).subscribe();
    }
  }

  prevPage(): void {
    const { skip, limit } = this.pagination();
    const prevSkip = Math.max(0, skip - limit);
    if (prevSkip !== skip) {
      this.loadPermissions(prevSkip, limit).subscribe();
    }
  }
}
