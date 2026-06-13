import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(({ user, token }) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', token);
              localStorage.setItem('auth_user', JSON.stringify(user));
            }
            return AuthActions.loginSuccess({ user, token });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({
              error: error.error?.message || 'Credenciales inválidas'
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
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, password, name }) =>
        this.authService.register(email, password, name).pipe(
          map(({ user, token }) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', token);
              localStorage.setItem('auth_user', JSON.stringify(user));
            }
            return AuthActions.registerSuccess({ user });
          }),
          catchError((error) =>
            of(AuthActions.registerFailure({
              error: error.error?.message || 'El registro falló'
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
          // La acción solo dispara la carga, el reducer maneja el estado
          // No devolvemos nada para evitar loops infinitos
        })
      ),
    { dispatch: false }
  );
}
