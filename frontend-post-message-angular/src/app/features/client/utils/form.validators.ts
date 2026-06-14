import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';
import { CLIENT_VALIDATION } from '../constants';

/**
 * Validates that a post title meets the minimum length requirement.
 */
export function postTitleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value.length >= CLIENT_VALIDATION.POST.TITLE_MIN_LENGTH
      ? null
      : { postTitleMinLength: { min: CLIENT_VALIDATION.POST.TITLE_MIN_LENGTH } };
  };
}

/**
 * Validates that a post body meets the minimum length requirement.
 */
export function postBodyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value.length >= CLIENT_VALIDATION.POST.BODY_MIN_LENGTH
      ? null
      : { postBodyMinLength: { min: CLIENT_VALIDATION.POST.BODY_MIN_LENGTH } };
  };
}

/**
 * Validates that a password meets the minimum length requirement.
 */
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value.length >= CLIENT_VALIDATION.PASSWORD.MIN_LENGTH
      ? null
      : { passwordMinLength: { min: CLIENT_VALIDATION.PASSWORD.MIN_LENGTH } };
  };
}

/**
 * Cross-field validator that checks two password fields match.
 */
export function passwordMatchValidator(field1: string, field2: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const formGroup = group as FormGroup;
    if (!formGroup.get(field1) || !formGroup.get(field2)) return null;

    const pwd = formGroup.get(field1)?.value;
    const confirm = formGroup.get(field2)?.value;
    return pwd === confirm ? null : { passwordMismatch: true };
  };
}

/**
 * Validates that a name field meets the minimum length requirement.
 */
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value.length >= CLIENT_VALIDATION.PROFILE.NAME_MIN_LENGTH
      ? null
      : { nameMinLength: { min: CLIENT_VALIDATION.PROFILE.NAME_MIN_LENGTH } };
  };
}
