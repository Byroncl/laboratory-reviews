export interface IAuthFormState {
  isLoading: boolean;
  isSubmitted: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  formErrors: Record<string, string | null>;
}

export interface IAuthError {
  code: string;
  message: string;
  statusCode: number;
}

export interface ISessionInfo {
  token: string;
  refreshToken?: string;
  expiresAt: number;
  user: IAuthSessionUser;
}

export interface IAuthSessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
}
