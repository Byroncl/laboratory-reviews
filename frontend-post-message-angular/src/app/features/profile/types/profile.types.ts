export type ProfileFieldName = 'name' | 'lastname' | 'email' | 'username' | 'phone' | 'bio';
export type PasswordFieldName = 'currentPassword' | 'newPassword' | 'confirmPassword';
export type ProfileFormMode = 'view' | 'edit';

export type ProfileAction =
  | { type: 'LOAD_PROFILE'; payload?: string }
  | { type: 'UPDATE_PROFILE'; payload: Record<string, any> }
  | { type: 'CHANGE_PASSWORD'; payload: Record<string, string> }
  | { type: 'LOGOUT' };

export type ProfileActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
