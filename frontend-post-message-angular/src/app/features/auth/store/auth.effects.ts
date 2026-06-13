import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';
import { decodeJwt } from '../utils/jwt.util';
import { AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ username, password }) =>
        this.authService.login(username, password).pipe(
          map(({ access_token }) => {
            const claims = decodeJwt(access_token);
            if (!claims) {
              return AuthActions.loginFailure({ error: 'Invalid token' });
            }
            const user: AuthUser = { id: claims.sub, username: claims.username, role: claims.type };
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', access_token);
              localStorage.setItem('auth_user', JSON.stringify(user));
            }
            return AuthActions.loginSuccess({ user, token: access_token });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({
              error: error.error?.message || 'Invalid credentials'
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          // Read returnUrl from the current URL's query params if we were redirected here
          const urlParams = new URLSearchParams(
            typeof window !== 'undefined' ? window.location.search : ''
          );
          const returnUrl = urlParams.get('returnUrl') ?? '/dashboard';
          this.router.navigate([returnUrl]);
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ username, password }) =>
        this.authService.login(username, password).pipe(
          map(({ access_token }) => {
            const claims = decodeJwt(access_token);
            if (!claims) {
              return AuthActions.registerFailure({ error: 'Invalid token' });
            }
            const user: AuthUser = { id: claims.sub, username: claims.username, role: claims.type };
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', access_token);
              localStorage.setItem('auth_user', JSON.stringify(user));
            }
            return AuthActions.registerSuccess({ user });
          }),
          catchError((error) =>
            of(AuthActions.registerFailure({
              error: error.error?.message || 'Registration failed'
            }))
          )
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  loadAuthFromStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadAuthFromStorage),
        tap(() => {
          // Reducer handles state hydration; this effect exists as a hook point only
        })
      ),
    { dispatch: false }
  );
}
