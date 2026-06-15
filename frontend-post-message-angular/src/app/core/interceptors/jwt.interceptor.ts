import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectToken } from '../../features/auth/store/auth.selectors';
import * as AuthActions from '../../features/auth/store/auth.actions';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private store: Store, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get token from localStorage (sync) or Redux store
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token');
      console.log('[JwtInterceptor] Token from localStorage:', token ? 'exists' : 'null', token?.substring(0, 20) + '...');
    }

    if (token) {
      console.log('[JwtInterceptor] Adding Authorization header');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log('[JwtInterceptor] No token to add');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

          // Only logout if there was a token but it got rejected (actually authenticated but invalid)
          // For now, just log the error instead of auto-logout to prevent getting stuck
          if (storedToken) {
            console.warn('[JwtInterceptor] 401 Unauthorized with valid token. Token may be expired or invalid.', error);
            // Optionally logout only on specific endpoints that explicitly require auth
            // For other endpoints, let the app handle the error
          }
        }
        return throwError(() => error);
      })
    );
  }
}
