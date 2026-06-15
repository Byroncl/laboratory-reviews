// utils/form.util.spec.ts
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { buildProfileForm, buildPasswordForm } from './form.util';
import { PROFILE_VALIDATION, PASSWORD_VALIDATION } from '../constants';
import { IUserProfile } from '../interfaces';

describe('form.util', () => {
  let fb: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule] });
    fb = TestBed.inject(FormBuilder);
  });

  // ─── buildProfileForm ────────────────────────────────────────────────────────

  describe('buildProfileForm', () => {
    it('should create a form with the expected controls', () => {
      const form = buildProfileForm(fb);
      expect(form.contains('name')).toBeTrue();
      expect(form.contains('lastname')).toBeTrue();
      expect(form.contains('email')).toBeTrue();
      expect(form.contains('username')).toBeTrue();
      expect(form.contains('phone')).toBeTrue();
      expect(form.contains('bio')).toBeTrue();
    });

    it('should pre-populate values from an existing user', () => {
      const user: IUserProfile = {
        name: 'Jane',
        lastname: 'Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        phone: '+1234567890',
        bio: 'Hello world',
      };
      const form = buildProfileForm(fb, user);
      expect(form.value.name).toBe('Jane');
      expect(form.value.lastname).toBe('Smith');
      expect(form.value.email).toBe('jane@example.com');
      expect(form.value.username).toBe('janesmith');
      expect(form.value.phone).toBe('+1234567890');
      expect(form.value.bio).toBe('Hello world');
    });

    it('should be invalid when name is empty', () => {
      const form = buildProfileForm(fb);
      form.patchValue({ name: '', lastname: 'Doe', email: 'a@b.com' });
      expect(form.get('name')?.valid).toBeFalse();
    });

    it('should be invalid when name is too short', () => {
      const form = buildProfileForm(fb);
      form.patchValue({ name: 'A' });
      expect(form.get('name')?.hasError('minlength')).toBeTrue();
    });

    it(`should be invalid when name exceeds ${PROFILE_VALIDATION.NAME_MAX} chars`, () => {
      const form = buildProfileForm(fb);
      form.patchValue({ name: 'A'.repeat(PROFILE_VALIDATION.NAME_MAX + 1) });
      expect(form.get('name')?.hasError('maxlength')).toBeTrue();
    });

    it('should be invalid for malformed email', () => {
      const form = buildProfileForm(fb);
      form.patchValue({ name: 'Jane', lastname: 'Smith', email: 'not-an-email' });
      expect(form.get('email')?.hasError('invalidEmail')).toBeTrue();
    });

    it('should be valid for a well-formed email', () => {
      const form = buildProfileForm(fb);
      form.patchValue({ email: 'test@domain.com' });
      expect(form.get('email')?.hasError('invalidEmail')).toBeFalse();
    });

    it(`should be invalid when bio exceeds ${PROFILE_VALIDATION.BIO_MAX} chars`, () => {
      const form = buildProfileForm(fb);
      form.patchValue({ bio: 'B'.repeat(PROFILE_VALIDATION.BIO_MAX + 1) });
      expect(form.get('bio')?.hasError('maxlength')).toBeTrue();
    });
  });

  // ─── buildPasswordForm ───────────────────────────────────────────────────────

  describe('buildPasswordForm', () => {
    it('should create a form with the expected controls', () => {
      const form = buildPasswordForm(fb);
      expect(form.contains('currentPassword')).toBeTrue();
      expect(form.contains('newPassword')).toBeTrue();
      expect(form.contains('confirmPassword')).toBeTrue();
    });

    it('should be invalid when currentPassword is empty', () => {
      const form = buildPasswordForm(fb);
      form.patchValue({ currentPassword: '', newPassword: 'StrongP@ss1', confirmPassword: 'StrongP@ss1' });
      expect(form.get('currentPassword')?.valid).toBeFalse();
    });

    it('should be invalid when newPassword is too short', () => {
      const form = buildPasswordForm(fb);
      form.patchValue({ newPassword: 'Ab1@' });
      expect(form.get('newPassword')?.hasError('minlength')).toBeTrue();
    });

    it('should be invalid when newPassword is weak', () => {
      const form = buildPasswordForm(fb);
      form.patchValue({ newPassword: 'alllowercase1@' });
      expect(form.get('newPassword')?.hasError('weakPassword')).toBeTrue();
    });

    it('should have passwordMismatch error when passwords do not match', () => {
      const form = buildPasswordForm(fb);
      form.patchValue({
        currentPassword: 'OldPass1@',
        newPassword: 'NewStr0ng@',
        confirmPassword: 'DifferentP@ss1',
      });
      expect(form.hasError('passwordMismatch')).toBeTrue();
    });

    it('should be valid when all fields are correctly filled', () => {
      const form = buildPasswordForm(fb);
      form.patchValue({
        currentPassword: 'OldPass1@',
        newPassword: 'NewStr0ng@',
        confirmPassword: 'NewStr0ng@',
      });
      expect(form.valid).toBeTrue();
    });
  });
});
