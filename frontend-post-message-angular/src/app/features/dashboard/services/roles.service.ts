import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { DASHBOARD_ENDPOINTS } from '../constants';
import { Role, ApiResponse, PaginatedResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private http: HttpClient) {}

  getAllRoles(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Role>> {
    return this.http
      .get<PaginatedResponse<Role>>(DASHBOARD_ENDPOINTS.ROLES.GET_ALL, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching roles:', error);
          return throwError(() => error);
        })
      );
  }

  getRoleById(id: string): Observable<ApiResponse<Role>> {
    return this.http
      .get<ApiResponse<Role>>(DASHBOARD_ENDPOINTS.ROLES.GET_BY_ID(id))
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching role:', error);
          return throwError(() => error);
        })
      );
  }

  createRole(data: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.http
      .post<ApiResponse<Role>>(DASHBOARD_ENDPOINTS.ROLES.CREATE, data)
      .pipe(
        catchError(error => {
          console.error('Error creating role:', error);
          return throwError(() => error);
        })
      );
  }

  updateRole(id: string, data: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.http
      .put<ApiResponse<Role>>(DASHBOARD_ENDPOINTS.ROLES.UPDATE(id), data)
      .pipe(
        catchError(error => {
          console.error('Error updating role:', error);
          return throwError(() => error);
        })
      );
  }

  deleteRole(id: string): Observable<void> {
    return this.http
      .delete<void>(DASHBOARD_ENDPOINTS.ROLES.DELETE(id))
      .pipe(
        catchError(error => {
          console.error('Error deleting role:', error);
          return throwError(() => error);
        })
      );
  }

  assignPermissions(id: string, permissionIds: string[]): Observable<ApiResponse<Role>> {
    return this.http
      .post<ApiResponse<Role>>(DASHBOARD_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id), { permissionIds })
      .pipe(
        catchError(error => {
          console.error('Error assigning permissions to role:', error);
          return throwError(() => error);
        })
      );
  }
}
