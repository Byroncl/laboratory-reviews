import { createAction, props } from '@ngrx/store';
import { AuthUser } from '../models/auth.model';

export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string; type?: 'user' | 'client' }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthUser; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const register = createAction(
  '[Auth] Register',
  props<{
    username: string;
    password: string;
    name: string;
    lastname: string;
    email: string;
    type: 'client';
  }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: AuthUser }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const loadAuthFromStorage = createAction('[Auth] Load From Storage');
