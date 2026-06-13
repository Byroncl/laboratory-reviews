import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../features/auth/store/auth.actions';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
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
          this.store.dispatch(AuthActions.logout());
        }
        return throwError(() => error);
      })
    );
  }
}
