import { IAuthUser, IAuthResponse } from '../interfaces';

export type AuthRole = 'admin' | 'editor' | 'viewer' | 'user';
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

// Discriminated union for auth actions
export type AuthAction =
  | { type: 'LOGIN'; payload: { username: string; password: string } }
  | { type: 'LOGIN_SUCCESS'; payload: IAuthResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER'; payload: { username: string; email: string; password: string; fullName: string } }
  | { type: 'REGISTER_SUCCESS'; payload: IAuthResponse }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'REFRESH_TOKEN'; payload: string }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: string }
  | { type: 'REFRESH_TOKEN_FAILURE'; payload: string }
  | { type: 'SET_USER'; payload: IAuthUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export interface IAuthUIState {
  isLoading: boolean;
  error: string | null;
  isShowPassword: boolean;
  isShowConfirmPassword: boolean;
}

export interface IAuthServiceState {
  currentUser: IAuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
