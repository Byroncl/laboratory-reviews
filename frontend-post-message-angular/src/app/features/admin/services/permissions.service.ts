import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Permission, CreatePermissionDto, UpdatePermissionDto, PermissionsPaginatedResponse } from '../../../shared/models/permission.model';
import { AdminBaseService } from './admin-base.service';
import { ADMIN_ENDPOINTS } from '../constants';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PermissionsService extends AdminBaseService<Permission> {
  readonly permissions$ = this.items$;
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

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

  bulkCreatePermissions(permissions: CreatePermissionDto[]): Observable<any> {
    return this.http.post(`${this.baseUrl}${ADMIN_ENDPOINTS.PERMISSIONS}/bulk`, permissions).pipe(
      tap((response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          this.items$.set([...this.items$(), ...response.data]);
        }
      })
    );
  }

  reloadPermissions(): Observable<PermissionsPaginatedResponse> {
    return this.loadPermissions(0, 100);
  }
}
