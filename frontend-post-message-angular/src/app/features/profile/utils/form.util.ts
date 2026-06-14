import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PROFILE_VALIDATION, PASSWORD_VALIDATION } from '../constants';
import {
  validatePasswordMatch,
  validatePasswordStrength,
  validateEmail,
  validatePhone,
} from './validation.util';
import { IUserProfile } from '../interfaces';

/**
 * Builds the profile edit FormGroup with all field validators.
 * Optionally pre-populates values from an existing user profile.
 */
export function buildProfileForm(fb: FormBuilder, user?: IUserProfile): FormGroup {
  return fb.group({
    name: [
      user?.name || '',
      [
        Validators.required,
        Validators.minLength(PROFILE_VALIDATION.NAME_MIN),
        Validators.maxLength(PROFILE_VALIDATION.NAME_MAX),
      ],
    ],
    lastname: [
      user?.lastname || '',
      [
        Validators.required,
        Validators.minLength(PROFILE_VALIDATION.LASTNAME_MIN),
        Validators.maxLength(PROFILE_VALIDATION.LASTNAME_MAX),
      ],
    ],
    email: [user?.email || '', [Validators.required, validateEmail]],
    username: [
      user?.username || '',
      [
        Validators.minLength(PROFILE_VALIDATION.USERNAME_MIN),
        Validators.maxLength(PROFILE_VALIDATION.USERNAME_MAX),
      ],
    ],
    phone: [user?.phone || '', validatePhone],
    bio: [user?.bio || '', Validators.maxLength(PROFILE_VALIDATION.BIO_MAX)],
  });
}

/**
 * Builds the change-password FormGroup with strength and match validators.
 */
export function buildPasswordForm(fb: FormBuilder): FormGroup {
  return fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(PASSWORD_VALIDATION.MIN_LENGTH),
          validatePasswordStrength,
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: validatePasswordMatch },
  );
}
