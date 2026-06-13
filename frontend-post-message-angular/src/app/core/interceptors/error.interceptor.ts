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

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error';

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          errorMessage = error.error?.message || `Error: ${error.status}`;
        }

        console.error('HTTP Error:', errorMessage);
        return throwError(() => ({ message: errorMessage, status: error.status }));
      })
    );
  }
}
