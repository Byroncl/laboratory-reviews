import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { DASHBOARD_ENDPOINTS } from '../constants';
import { Permission, ApiResponse, PaginatedResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  constructor(private http: HttpClient) {}

  getAllPermissions(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Permission>> {
    return this.http
      .get<PaginatedResponse<Permission>>(DASHBOARD_ENDPOINTS.PERMISSIONS.GET_ALL, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching permissions:', error);
          return throwError(() => error);
        })
      );
  }

  getPermissionById(id: string): Observable<ApiResponse<Permission>> {
    return this.http
      .get<ApiResponse<Permission>>(DASHBOARD_ENDPOINTS.PERMISSIONS.GET_BY_ID(id))
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching permission:', error);
          return throwError(() => error);
        })
      );
  }

  createPermission(data: Partial<Permission>): Observable<ApiResponse<Permission>> {
    return this.http
      .post<ApiResponse<Permission>>(DASHBOARD_ENDPOINTS.PERMISSIONS.CREATE, data)
      .pipe(
        catchError(error => {
          console.error('Error creating permission:', error);
          return throwError(() => error);
        })
      );
  }

  updatePermission(id: string, data: Partial<Permission>): Observable<ApiResponse<Permission>> {
    return this.http
      .put<ApiResponse<Permission>>(DASHBOARD_ENDPOINTS.PERMISSIONS.UPDATE(id), data)
      .pipe(
        catchError(error => {
          console.error('Error updating permission:', error);
          return throwError(() => error);
        })
      );
  }

  deletePermission(id: string): Observable<void> {
    return this.http
      .delete<void>(DASHBOARD_ENDPOINTS.PERMISSIONS.DELETE(id))
      .pipe(
        catchError(error => {
          console.error('Error deleting permission:', error);
          return throwError(() => error);
        })
      );
  }
}
