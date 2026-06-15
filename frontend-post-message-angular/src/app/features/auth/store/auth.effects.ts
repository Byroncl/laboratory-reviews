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
      switchMap(({ username, password, accountType }) => {
        console.log('[AuthEffects] login$ - attempting login:', { username, accountType });
        return this.authService.login({ username, password, type: accountType }).pipe(
          map(({ access_token }) => {
            console.log('[AuthEffects] login$ - got token, decoding...');
            const claims = decodeJwt(access_token);
            console.log('[AuthEffects] login$ - decoded claims:', claims);
            if (!claims) {
              console.log('[AuthEffects] login$ - no claims, returning loginFailure');
              return AuthActions.loginFailure({ error: 'Invalid token' });
            }
            const user: AuthUser = { id: claims.sub, username: claims.username, role: claims.type };
            console.log('[AuthEffects] login$ - created user:', user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', access_token);
              localStorage.setItem('auth_user', JSON.stringify(user));
            }
            console.log('[AuthEffects] login$ - returning loginSuccess');
            return AuthActions.loginSuccess({ user, token: access_token });
          }),
          catchError((error) => {
            const errorMessage = this.extractErrorMessage(error);
            console.log('[AuthEffects] login$ - error:', errorMessage);
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, token }) => {
          console.log('[AuthEffects] loginSuccess$ - user:', user);
          // Decode JWT to get role
          const claims = decodeJwt(token);
          const roleFromJwt = claims?.role || user.role || 'user';
          console.log('[AuthEffects] loginSuccess$ - role from JWT:', roleFromJwt);

          // Load user permissions based on role
          const userRole = {
            id: user.id,
            name: roleFromJwt,
            identifier: roleFromJwt,
            permissions: this.getRolePermissions(roleFromJwt),
          };
          console.log('[AuthEffects] Setting user role:', userRole);
          this.permissionsService.setUserRole(userRole);
          console.log('[AuthEffects] isAdmin?', this.permissionsService.isAdmin());

          // Determine navigation URL based on type
          const navigationUrl = user.role === 'client' ? '/home' : '/dashboard';
          console.log('[AuthEffects] Navigating to:', navigationUrl);
          this.router.navigate([navigationUrl]);
        })
      ),
    { dispatch: false }
  );

  private getRolePermissions(role: string): any[] {
    // Map backend roles from seed to frontend permissions
    // Roles from seed: admin, moderator, user, client
    const adminPermissions = [
      { identifier: 'view_dashboard', name: 'View Dashboard' },
      { identifier: 'manage_users', name: 'Manage Users' },
      { identifier: 'manage_roles', name: 'Manage Roles' },
      { identifier: 'manage_permissions', name: 'Manage Permissions' },
      { identifier: 'view_audit_logs', name: 'View Audit Logs' },
      { identifier: 'manage_clients', name: 'Manage Clients' },
      { identifier: 'manage_posts', name: 'Manage Posts' },
      { identifier: 'manage_comments', name: 'Manage Comments' },
      { identifier: 'view_statistics', name: 'View Statistics' },
    ];

    const moderatorPermissions = [
      { identifier: 'manage_posts', name: 'Manage Posts' },
      { identifier: 'manage_comments', name: 'Manage Comments' },
    ];

    const rolePermissions: Record<string, any[]> = {
      admin: adminPermissions,
      moderator: moderatorPermissions,
      user: [], // Regular users don't have dashboard access
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
    };

    return rolePermissions[role] || [];
  }

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ username, password, name, lastname, email, accountType }) =>
        this.authService.register({
          username,
          password,
          name,
          lastname,
          email,
          type: accountType
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
            return AuthActions.registerSuccess({ user, token: access_token });
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
          console.log('[AuthEffects] loadAuthFromStorage$ - restoring permissions from storage');
          // After reducer restores from storage, restore permissions too
          if (typeof window !== 'undefined') {
            const userRaw = localStorage.getItem('auth_user');
            const tokenRaw = localStorage.getItem('auth_token');
            console.log('[AuthEffects] loadAuthFromStorage$ - userRaw:', userRaw);
            if (userRaw && tokenRaw) {
              try {
                const user = JSON.parse(userRaw) as AuthUser;
                const claims = decodeJwt(tokenRaw);
                const roleFromJwt = claims?.role || user.role || 'user';
                console.log('[AuthEffects] loadAuthFromStorage$ - parsed user:', user, 'role from JWT:', roleFromJwt);
                const userRole = {
                  id: user.id,
                  name: roleFromJwt,
                  identifier: roleFromJwt,
                  permissions: this.getRolePermissions(roleFromJwt),
                };
                console.log('[AuthEffects] loadAuthFromStorage$ - setting user role:', userRole);
                this.permissionsService.setUserRole(userRole);
                console.log('[AuthEffects] loadAuthFromStorage$ - permissions restored');
              } catch (e) {
                console.log('[AuthEffects] Failed to restore permissions from storage:', e);
              }
            }
          }
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
