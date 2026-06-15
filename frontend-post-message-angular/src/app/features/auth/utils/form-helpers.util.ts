import { FormGroup, AbstractControl } from '@angular/forms';

/**
 * Get all form field errors as a flat map
 */
export function getFormErrors(form: FormGroup): Record<string, string | null> {
  const errors: Record<string, string | null> = {};

  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    errors[key] = control?.errors ? getErrorMessage(key, control.errors) : null;
  });

  return errors;
}

/**
 * Get human-readable error message for a control
 */
export function getErrorMessage(fieldName: string, errors: any): string {
  if (errors['required']) return `${fieldName} is required`;
  if (errors['minlength']) return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
  if (errors['maxlength']) return `${fieldName} must be no more than ${errors['maxlength'].requiredLength} characters`;
  if (errors['email']) return 'Invalid email format';
  if (errors['pattern']) return `${fieldName} format is invalid`;
  if (errors['passwordMismatch']) return 'Passwords do not match';
  if (errors['passwordStrength']) return 'Password must include uppercase, lowercase, numbers, and symbols';
  if (errors['invalidEmail']) return 'Invalid email format';
  if (errors['invalidUsername']) return 'Username can only contain letters, numbers, dash, and underscore';

  return 'Invalid value';
}

/**
 * Check if form is valid and touched
 */
export function isFormValid(form: FormGroup): boolean {
  return form.valid && form.touched;
}

/**
 * Check if a field has errors and is touched
 */
export function hasFieldError(form: FormGroup, fieldName: string): boolean {
  const field = form.get(fieldName);
  return !!field && field.invalid && (field.dirty || field.touched);
}

/**
 * Mark all fields as touched (useful for showing errors on submit)
 */
export function markFormAsTouched(form: FormGroup): void {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    control?.markAsTouched();

    if (control instanceof FormGroup) {
      markFormAsTouched(control);
    }
  });
}

/**
 * Reset form with optional preserving of some fields
 */
export function resetForm(form: FormGroup, preserveFields?: string[]): void {
  Object.keys(form.controls).forEach(key => {
    if (!preserveFields || !preserveFields.includes(key)) {
      form.get(key)?.reset();
    }
  });
  form.markAsUntouched();
}
