export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
