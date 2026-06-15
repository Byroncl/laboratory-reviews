import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { CLIENT_ENDPOINTS } from '../constants';
import { ClientProfileDto, UpdateProfileFormData, ChangePasswordFormData, ApiResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ClientProfileService {
  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<ApiResponse<ClientProfileDto>> {
    return this.http
      .get<ApiResponse<ClientProfileDto>>(CLIENT_ENDPOINTS.PROFILE.GET_PROFILE)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching profile:', error);
          return throwError(() => error);
        })
      );
  }

  updateProfile(data: UpdateProfileFormData): Observable<ApiResponse<ClientProfileDto>> {
    return this.http
      .put<ApiResponse<ClientProfileDto>>(CLIENT_ENDPOINTS.PROFILE.UPDATE_PROFILE, data)
      .pipe(
        catchError(error => {
          console.error('Error updating profile:', error);
          return throwError(() => error);
        })
      );
  }

  changePassword(data: ChangePasswordFormData): Observable<ApiResponse<{ message: string }>> {
    return this.http
      .post<ApiResponse<{ message: string }>>(CLIENT_ENDPOINTS.PROFILE.CHANGE_PASSWORD, data)
      .pipe(
        catchError(error => {
          console.error('Error changing password:', error);
          return throwError(() => error);
        })
      );
  }
}
