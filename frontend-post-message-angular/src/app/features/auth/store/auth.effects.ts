import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';
import { decodeJwt } from '../utils/jwt.util';
import { AuthUser } from '../models/auth.model';
import { PermissionsService } from '../../../core/services/permissions.service';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private permissionsService = inject(PermissionsService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ username, password }) =>
        this.authService.login({ username, password }).pipe(
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
          catchError((error) => {
            const errorMessage = this.extractErrorMessage(error);
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          // Load user permissions based on role
          const userRole = {
            id: user.id,
            name: user.role,
            identifier: user.role,
            permissions: this.getRolePermissions(user.role),
          };
          this.permissionsService.setUserRole(userRole);

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

  private getRolePermissions(role: string): any[] {
    // Map roles to permissions
    const rolePermissions: Record<string, any[]> = {
      admin: [
        { identifier: 'view_dashboard', name: 'View Dashboard' },
        { identifier: 'manage_users', name: 'Manage Users' },
        { identifier: 'manage_roles', name: 'Manage Roles' },
        { identifier: 'manage_permissions', name: 'Manage Permissions' },
        { identifier: 'view_audit_logs', name: 'View Audit Logs' },
        { identifier: 'manage_clients', name: 'Manage Clients' },
        { identifier: 'manage_posts', name: 'Manage Posts' },
        { identifier: 'manage_comments', name: 'Manage Comments' },
        { identifier: 'view_statistics', name: 'View Statistics' },
      ],
      client: [
        { identifier: 'create_posts', name: 'Create Posts' },
        { identifier: 'edit_own_posts', name: 'Edit Own Posts' },
        { identifier: 'delete_own_posts', name: 'Delete Own Posts' },
        { identifier: 'create_comments', name: 'Create Comments' },
        { identifier: 'view_own_profile', name: 'View Own Profile' },
        { identifier: 'edit_own_profile', name: 'Edit Own Profile' },
        { identifier: 'create_favorites', name: 'Create Favorites' },
        { identifier: 'view_favorites', name: 'View Favorites' },
      ],
      user: [
        { identifier: 'view_public_posts', name: 'View Public Posts' },
        { identifier: 'view_comments', name: 'View Comments' },
      ],
    };

    return rolePermissions[role] || [];
  }

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ username, password, name, lastname, email, type }) =>
        this.authService.register({
          username,
          password,
          name,
          lastname,
          email,
          type
        }).pipe(
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
          catchError((error) => {
            const errorMessage = this.extractErrorMessage(error, 'Registration failed');
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user }) => {
          // Load user permissions based on role
          const userRole = {
            id: user.id,
            name: user.role,
            identifier: user.role,
            permissions: this.getRolePermissions(user.role),
          };
          this.permissionsService.setUserRole(userRole);
          this.router.navigate(['/dashboard']);
        })
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
          this.permissionsService.clear();
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

  private extractErrorMessage(error: any, defaultMessage = 'Invalid credentials'): string {
    // Handle array of messages (from validation errors)
    if (Array.isArray(error.error?.message)) {
      return error.error.message.join('\n');
    }
    // Handle single message string
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
    // Handle error object with message property
    if (error.error?.error) {
      return error.error.error;
    }
    // Handle string error response
    if (typeof error.error === 'string') {
      return error.error;
    }
    // Default fallback
    return defaultMessage;
  }
}
