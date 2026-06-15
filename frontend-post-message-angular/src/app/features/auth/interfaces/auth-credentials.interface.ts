export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface IAuthResponse {
  access_token: string;
  refresh_token?: string;
  user: IAuthUser;
  expiresIn?: number;
}

export interface IAuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  isActive?: boolean;
}

export interface ITokenPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
