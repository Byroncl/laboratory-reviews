import { VALIDATION } from '../constants/validation.constants';
import { AUTH_CONFIG } from '../constants/auth.constants';

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    return VALIDATION.EMAIL_REGEX.test(email);
  }

  static isValidUsername(username: string): boolean {
    return (
      username.length >= VALIDATION.USERNAME_MIN &&
      username.length <= VALIDATION.USERNAME_MAX &&
      VALIDATION.USERNAME_REGEX.test(username)
    );
  }

  static isValidPassword(password: string): boolean {
    return password.length >= AUTH_CONFIG.PASSWORD_MIN_LENGTH;
  }

  static isStrongPassword(password: string): boolean {
    return VALIDATION.PASSWORD_REGEX.test(password);
  }
}
