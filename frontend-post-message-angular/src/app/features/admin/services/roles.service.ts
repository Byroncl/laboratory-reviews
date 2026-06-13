import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Role, CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RolesPaginatedResponse } from '../../../shared/models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  readonly roles$ = signal<Role[]>([]);
  readonly roles = this.roles$; // Alias for consistency
  readonly loading$ = signal<boolean>(false);
  readonly error$ = signal<string | null>(null);

  readonly pagination = signal<{ skip: number; limit: number; total: number }>({
    skip: 0,
    limit: 10,
    total: 0,
  });

  readonly totalRoles = computed(() => this.pagination().total || this.roles$().length);
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
    console.log('[RolesService] initialized');
  }

  private roleId(role: Role): string {
    return (role._id ?? role.id) as string;
  }

  loadRoles(skip: number = 0, limit: number = 10, name?: string): Observable<RolesPaginatedResponse> {
    console.log('[RolesService] loadRoles', { skip, limit, name });
    this.loading$.set(true);
    this.error$.set(null);

    const params: Record<string, unknown> = { skip, limit };
    if (name) params['name'] = name;

    return this.api.get<RolesPaginatedResponse>('/roles', params).pipe(
      tap(response => {
        const data = response.data;
        if (data && 'items' in data) {
          this.roles$.set(data.items ?? []);
          this.pagination.set({ skip, limit, total: data.total ?? 0 });
        } else {
          this.roles$.set((data as Role[]) ?? []);
          this.pagination.set({ skip, limit, total: ((data as Role[]) ?? []).length });
        }
        this.loading$.set(false);
        console.log('[RolesService] loadRoles success', { count: this.roles$().length });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to load roles';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[RolesService] loadRoles error', err);
        return throwError(() => err);
      })
    );
  }

  createRole(dto: CreateRoleDto): Observable<{ data: Role; message: string }> {
    console.log('[RolesService] createRole', dto);
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.post<{ data: Role; message: string }>('/roles', dto).pipe(
      tap(response => {
        this.roles$.set([response.data, ...this.roles$()]);
        this.loading$.set(false);
        console.log('[RolesService] createRole success', response.data);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to create role';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[RolesService] createRole error', err);
        return throwError(() => err);
      })
    );
  }

  updateRole(id: string, dto: UpdateRoleDto): Observable<{ data: Role; message: string }> {
    console.log('[RolesService] updateRole', { id, dto });
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.put<{ data: Role; message: string }>(`/roles/${id}`, dto).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.roles$().findIndex(r => this.roleId(r) === id);
        if (index !== -1) {
          const roles = [...this.roles$()];
          roles[index] = updated;
          this.roles$.set(roles);
        }
        this.loading$.set(false);
        console.log('[RolesService] updateRole success', updated);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to update role';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[RolesService] updateRole error', err);
        return throwError(() => err);
      })
    );
  }

  deleteRole(id: string): Observable<{ message: string }> {
    console.log('[RolesService] deleteRole', { id });
    this.loading$.set(true);
    this.error$.set(null);

    return this.api.delete<{ message: string }>(`/roles/${id}`).pipe(
      tap(() => {
        this.roles$.set(this.roles$().filter(r => this.roleId(r) !== id));
        this.loading$.set(false);
        console.log('[RolesService] deleteRole success', { id });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to delete role';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[RolesService] deleteRole error', err);
        return throwError(() => err);
      })
    );
  }

  assignPermissions(id: string, permissionIds: string[]): Observable<{ data: Role; message: string }> {
    console.log('[RolesService] assignPermissions', { id, permissionIds });
    this.loading$.set(true);
    this.error$.set(null);

    const dto: AssignPermissionsDto = { permissionIds };

    return this.api.post<{ data: Role; message: string }>(`/roles/${id}/permissions`, dto).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.roles$().findIndex(r => this.roleId(r) === id);
        if (index !== -1) {
          const roles = [...this.roles$()];
          roles[index] = updated;
          this.roles$.set(roles);
        }
        this.loading$.set(false);
        console.log('[RolesService] assignPermissions success', updated);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to assign permissions';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[RolesService] assignPermissions error', err);
        return throwError(() => err);
      })
    );
  }

  nextPage(): void {
    const { skip, limit, total } = this.pagination();
    const nextSkip = skip + limit;
    if (nextSkip < total) {
      this.loadRoles(nextSkip, limit).subscribe();
    }
  }

  prevPage(): void {
    const { skip, limit } = this.pagination();
    const prevSkip = Math.max(0, skip - limit);
    if (prevSkip !== skip) {
      this.loadRoles(prevSkip, limit).subscribe();
    }
  }
}
