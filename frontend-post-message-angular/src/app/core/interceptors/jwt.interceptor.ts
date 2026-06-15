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
    }

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Only logout if token exists but is invalid
          // Don't logout if there was never a token
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (storedToken) {
            const capturedUrl = this.router.url;
            this.store.dispatch(AuthActions.logout());
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: capturedUrl } });
          }
        }
        return throwError(() => error);
      })
    );
  }
}
