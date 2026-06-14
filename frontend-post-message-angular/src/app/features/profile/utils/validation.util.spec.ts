// utils/validation.util.spec.ts
import { FormControl, FormGroup } from '@angular/forms';
import {
  validatePasswordStrength,
  validatePasswordMatch,
  validateEmail,
  validatePhone,
} from './validation.util';

describe('validation.util', () => {
  // ─── validatePasswordStrength ────────────────────────────────────────────────

  describe('validatePasswordStrength', () => {
    it('should return null for a strong password', () => {
      const control = new FormControl('StrongP@ss1');
      expect(validatePasswordStrength(control)).toBeNull();
    });

    it('should return { weakPassword: true } for a weak password (no special char)', () => {
      const control = new FormControl('Weakpassword1');
      expect(validatePasswordStrength(control)).toEqual({ weakPassword: true });
    });

    it('should return { weakPassword: true } for a password with no uppercase', () => {
      const control = new FormControl('weakpass1@');
      expect(validatePasswordStrength(control)).toEqual({ weakPassword: true });
    });

    it('should return { weakPassword: true } for a password with no digit', () => {
      const control = new FormControl('StrongPass@');
      expect(validatePasswordStrength(control)).toEqual({ weakPassword: true });
    });

    it('should return null for an empty value (not required check)', () => {
      const control = new FormControl('');
      expect(validatePasswordStrength(control)).toBeNull();
    });

    it('should return null for a null value', () => {
      const control = new FormControl(null);
      expect(validatePasswordStrength(control)).toBeNull();
    });
  });

  // ─── validatePasswordMatch ───────────────────────────────────────────────────

  describe('validatePasswordMatch', () => {
    function makeGroup(newPassword: string, confirmPassword: string): FormGroup {
      return new FormGroup({
        newPassword: new FormControl(newPassword),
        confirmPassword: new FormControl(confirmPassword),
      });
    }

    it('should return null when passwords match', () => {
      const group = makeGroup('MyP@ss1', 'MyP@ss1');
      expect(validatePasswordMatch(group)).toBeNull();
    });

    it('should return { passwordMismatch: true } when passwords do not match', () => {
      const group = makeGroup('MyP@ss1', 'Different1@');
      expect(validatePasswordMatch(group)).toEqual({ passwordMismatch: true });
    });

    it('should return null when newPassword is empty', () => {
      const group = makeGroup('', 'Something');
      expect(validatePasswordMatch(group)).toBeNull();
    });

    it('should return null when confirmPassword is empty', () => {
      const group = makeGroup('Something', '');
      expect(validatePasswordMatch(group)).toBeNull();
    });

    it('should return null when both are empty', () => {
      const group = makeGroup('', '');
      expect(validatePasswordMatch(group)).toBeNull();
    });
  });

  // ─── validateEmail ───────────────────────────────────────────────────────────

  describe('validateEmail', () => {
    it('should return null for a valid email', () => {
      const control = new FormControl('user@example.com');
      expect(validateEmail(control)).toBeNull();
    });

    it('should return { invalidEmail: true } for a missing @', () => {
      const control = new FormControl('userexample.com');
      expect(validateEmail(control)).toEqual({ invalidEmail: true });
    });

    it('should return { invalidEmail: true } for a missing domain part', () => {
      const control = new FormControl('user@');
      expect(validateEmail(control)).toEqual({ invalidEmail: true });
    });

    it('should return null for an empty value', () => {
      const control = new FormControl('');
      expect(validateEmail(control)).toBeNull();
    });

    it('should return null for a null value', () => {
      const control = new FormControl(null);
      expect(validateEmail(control)).toBeNull();
    });
  });

  // ─── validatePhone ───────────────────────────────────────────────────────────

  describe('validatePhone', () => {
    it('should return null for a valid phone number', () => {
      const control = new FormControl('+1 555 123 4567');
      expect(validatePhone(control)).toBeNull();
    });

    it('should return null for a local phone number', () => {
      const control = new FormControl('5551234567');
      expect(validatePhone(control)).toBeNull();
    });

    it('should return { invalidPhone: true } for a too-short number', () => {
      const control = new FormControl('123');
      expect(validatePhone(control)).toEqual({ invalidPhone: true });
    });

    it('should return null for an empty value', () => {
      const control = new FormControl('');
      expect(validatePhone(control)).toBeNull();
    });

    it('should return null for a null value', () => {
      const control = new FormControl(null);
      expect(validatePhone(control)).toBeNull();
    });
  });
});
