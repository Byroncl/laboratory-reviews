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
import { decodeJwt } from '../../features/auth/utils/jwt.util';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private store: Store, private router: Router) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token');
      if (token) {
        const claims = decodeJwt(token);
      }
    }

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // For comment-related POST/PUT/DELETE requests, inject userId and author from JWT
      const isCommentEndpoint = request.url.includes('/api/comments');
      if (isCommentEndpoint && (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
        const claims = decodeJwt(token);
        if (claims && request.body) {
          const body = request.body as Record<string, any>;
          const updatedBody = {
            ...body,
            userId: body['userId'] || claims.sub,
            author: body['author'] || claims.username
          };
          request = request.clone({
            body: updatedBody
          });
        }
      }
    } else {
      console.log('[JwtInterceptor] No token found for', request.url);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

          if (storedToken) {
            console.warn('[JwtInterceptor] 401 Unauthorized. Possible reasons:', {
              tokenExists: !!storedToken,
              error: error.error,
              url: error.url
            });
          }
        }
        return throwError(() => error);
      })
    );
  }
}
