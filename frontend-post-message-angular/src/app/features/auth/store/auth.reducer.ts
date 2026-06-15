import { createReducer, on } from '@ngrx/store';
import { AuthState, AuthUser } from '../models/auth.model';
import * as AuthActions from './auth.actions';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  token: null,
};

function isValidAuthUser(parsed: unknown): parsed is AuthUser {
  if (!parsed || typeof parsed !== 'object') return false;
  const u = parsed as Record<string, unknown>;
  return typeof u['username'] === 'string' && typeof u['role'] === 'string' && typeof u['id'] === 'string';
}

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoading: false,
    isAuthenticated: true,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    isAuthenticated: false,
  })),
  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoading: false,
    isAuthenticated: true,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(AuthActions.logout, () => initialState),
  on(AuthActions.loadAuthFromStorage, (state) => {
    if (typeof window === 'undefined') {
      return state;
    }

    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user');

    console.log('[AuthReducer] loadAuthFromStorage - token:', token ? 'exists' : 'null', 'user:', userRaw);

    if (token && userRaw) {
      try {
        const parsed: unknown = JSON.parse(userRaw);
        console.log('[AuthReducer] Parsed user:', parsed);
        console.log('[AuthReducer] isValidAuthUser:', isValidAuthUser(parsed));

        if (!isValidAuthUser(parsed)) {
          // Legacy shape (email/name) or invalid — clear and stay logged out
          console.log('[AuthReducer] User invalid, clearing token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          return { ...initialState };
        }

        console.log('[AuthReducer] User valid, restoring state');
        return {
          ...state,
          token,
          user: parsed,
          isAuthenticated: true,
        };
      } catch (error) {
        console.log('[AuthReducer] JSON parse error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        return { ...initialState };
      }
    }

    return state;
  })
);
