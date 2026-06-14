import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientProfile {
  _id: string;
  name: string;
  lastname: string;
  username: string;
  email: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ClientProfileService {
  private readonly apiUrl = '/api/clients';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<ClientProfile>): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
    });
  }
}
