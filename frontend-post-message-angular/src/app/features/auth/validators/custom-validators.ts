import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';
import { PASSWORD_REGEX, AUTH_FORM_RULES } from '../constants';

/**
 * Validate password strength based on complexity rules
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const errors: Record<string, boolean> = {};

    if (!PASSWORD_REGEX.UPPERCASE.test(value)) {
      errors['uppercase'] = true;
    }
    if (!PASSWORD_REGEX.LOWERCASE.test(value)) {
      errors['lowercase'] = true;
    }
    if (!PASSWORD_REGEX.NUMBERS.test(value)) {
      errors['numbers'] = true;
    }
    if (!PASSWORD_REGEX.SPECIAL_CHARS.test(value)) {
      errors['specialChars'] = true;
    }

    return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
  };
}

/**
 * Validate that two password fields match
 */
export function passwordMatchValidator(passwordField: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (!(group instanceof FormGroup)) return null;

    const password = group.get(passwordField);
    const confirmPassword = group.get(confirmField);

    if (!password || !confirmPassword) return null;
    if (!password.value || !confirmPassword.value) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };
}

/**
 * Validate email format
 */
export function emailValidator(): ValidatorFn {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  };
}

/**
 * Validate username format (alphanumeric, dash, underscore only)
 */
export function usernameValidator(): ValidatorFn {
  const usernameRegex = AUTH_FORM_RULES.USERNAME.pattern;
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return usernameRegex.test(control.value) ? null : { invalidUsername: true };
  };
}

/**
 * Calculate password strength (0-5 scale)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= AUTH_FORM_RULES.PASSWORD.minLength) strength++;
  if (password.length >= 12) strength++;
  if (PASSWORD_REGEX.UPPERCASE.test(password)) strength++;
  if (PASSWORD_REGEX.LOWERCASE.test(password)) strength++;
  if (PASSWORD_REGEX.NUMBERS.test(password)) strength++;
  if (PASSWORD_REGEX.SPECIAL_CHARS.test(password)) strength++;

  return Math.min(strength, 5);
}

/**
 * Map strength score to label
 */
export function getPasswordStrengthLabel(strength: number): string {
  const labels = ['weak', 'weak', 'fair', 'good', 'strong', 'very-strong'];
  return labels[strength] || 'weak';
}
