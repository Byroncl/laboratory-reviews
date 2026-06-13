import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    );
  }

  register(email: string, password: string, name: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(
      `${this.apiUrl}/auth/register`,
      { email, password, name }
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
