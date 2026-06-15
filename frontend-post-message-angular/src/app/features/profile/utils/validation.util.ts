import { AbstractControl, ValidationErrors } from '@angular/forms';
import { PASSWORD_VALIDATION, PROFILE_VALIDATION } from '../constants';

/**
 * Validates that a password meets the strength requirements.
 * Must contain at least one uppercase, one lowercase, one digit,
 * and one special character.
 */
export function validatePasswordStrength(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const isStrong = PASSWORD_VALIDATION.STRENGTH_PATTERN.test(value);
  return isStrong ? null : { weakPassword: true };
}

/**
 * Cross-field validator for a FormGroup that checks newPassword === confirmPassword.
 */
export function validatePasswordMatch(
  group: AbstractControl,
): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (!newPassword || !confirmPassword) return null;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

/**
 * Validates email format using the profile validation pattern.
 */
export function validateEmail(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const isValid = PROFILE_VALIDATION.EMAIL_PATTERN.test(value);
  return isValid ? null : { invalidEmail: true };
}

/**
 * Validates phone number format using the profile validation pattern.
 */
export function validatePhone(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const isValid = PROFILE_VALIDATION.PHONE_PATTERN.test(value);
  return isValid ? null : { invalidPhone: true };
}
