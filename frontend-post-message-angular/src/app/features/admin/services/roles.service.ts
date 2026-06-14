import { Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, retry } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Role, CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RolesPaginatedResponse } from '../../../shared/models/role.model';
import { AdminBaseService } from './admin-base.service';
import { ADMIN_ENDPOINTS, ADMIN_SUB_ENDPOINTS } from '../constants';

@Injectable({ providedIn: 'root' })
export class RolesService extends AdminBaseService<Role> {
  readonly roles$ = this.items$; // Alias for consistency

  protected endpoint = ADMIN_ENDPOINTS.ROLES;

  loadRoles(skip: number = 0, limit: number = 10, name?: string): Observable<RolesPaginatedResponse> {
    const params = name ? { name } : {};
    return this.loadItems(skip, limit, params);
  }

  createRole(dto: CreateRoleDto): Observable<{ data: Role; message: string }> {
    return this.createItem(dto) as Observable<any>;
  }

  updateRole(id: string, dto: UpdateRoleDto): Observable<{ data: Role; message: string }> {
    return this.updateItem(id, dto) as Observable<any>;
  }

  deleteRole(id: string): Observable<{ message: string }> {
    return this.deleteItem(id) as Observable<any>;
  }

  assignPermissions(id: string, permissionIds: string[]): Observable<{ data: Role; message: string }> {
    this.loading$.set(true);
    this.error$.set(null);

    const dto: AssignPermissionsDto = { permissionIds };

    return this.api.post<{ data: Role; message: string }>(
      `${this.endpoint}/${id}/${ADMIN_SUB_ENDPOINTS.PERMISSIONS_ASSIGN}`,
      dto
    ).pipe(
      tap(response => this._handleUpdateSuccess(response, id)),
      catchError(err => this._handleError(err, 'Failed to assign permissions'))
    );
  }
}
