export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
}
