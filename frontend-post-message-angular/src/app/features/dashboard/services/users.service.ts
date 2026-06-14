import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { DASHBOARD_ENDPOINTS } from '../constants';
import { User, ApiResponse, PaginatedResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 1, limit: number = 10): Observable<PaginatedResponse<User>> {
    return this.http
      .get<PaginatedResponse<User>>(DASHBOARD_ENDPOINTS.USERS.GET_ALL, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching users:', error);
          return throwError(() => error);
        })
      );
  }

  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(DASHBOARD_ENDPOINTS.USERS.GET_BY_ID(id))
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching user:', error);
          return throwError(() => error);
        })
      );
  }

  createUser(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(DASHBOARD_ENDPOINTS.USERS.CREATE, data)
      .pipe(
        catchError(error => {
          console.error('Error creating user:', error);
          return throwError(() => error);
        })
      );
  }

  updateUser(id: string, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http
      .put<ApiResponse<User>>(DASHBOARD_ENDPOINTS.USERS.UPDATE(id), data)
      .pipe(
        catchError(error => {
          console.error('Error updating user:', error);
          return throwError(() => error);
        })
      );
  }

  deleteUser(id: string): Observable<void> {
    return this.http
      .delete<void>(DASHBOARD_ENDPOINTS.USERS.DELETE(id))
      .pipe(
        catchError(error => {
          console.error('Error deleting user:', error);
          return throwError(() => error);
        })
      );
  }

  toggleUserStatus(id: string): Observable<ApiResponse<User>> {
    return this.http
      .patch<ApiResponse<User>>(DASHBOARD_ENDPOINTS.USERS.TOGGLE_STATUS(id), {})
      .pipe(
        catchError(error => {
          console.error('Error toggling user status:', error);
          return throwError(() => error);
        })
      );
  }
}
