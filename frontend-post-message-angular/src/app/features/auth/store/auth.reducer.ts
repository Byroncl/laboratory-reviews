import { createReducer, on } from '@ngrx/store';
import { AuthState } from '../models/auth.model';
import * as AuthActions from './auth.actions';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  token: null,
};

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
  on(AuthActions.registerSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    isAuthenticated: false,
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
    const user = localStorage.getItem('auth_user');

    if (token && user) {
      try {
        return {
          ...state,
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
        };
      } catch {
        return state;
      }
    }

    return state;
  })
);
