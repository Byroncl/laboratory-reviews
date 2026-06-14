import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Permission, CreatePermissionDto, UpdatePermissionDto, PermissionsPaginatedResponse } from '../../../shared/models/permission.model';
import { AdminBaseService } from './admin-base.service';
import { ADMIN_ENDPOINTS } from '../constants';

@Injectable({ providedIn: 'root' })
export class PermissionsService extends AdminBaseService<Permission> {
  readonly permissions$ = this.items$;

  protected endpoint = ADMIN_ENDPOINTS.PERMISSIONS;

  loadPermissions(skip: number = 0, limit: number = 10): Observable<PermissionsPaginatedResponse> {
    return this.loadItems(skip, limit);
  }

  createPermission(dto: CreatePermissionDto): Observable<{ data: Permission; message: string }> {
    return this.createItem(dto as any) as Observable<any>;
  }

  updatePermission(id: string, dto: UpdatePermissionDto): Observable<{ data: Permission; message: string }> {
    return this.updateItem(id, dto as any) as Observable<any>;
  }

  deletePermission(id: string): Observable<{ message: string }> {
    return this.deleteItem(id) as Observable<any>;
  }
}
