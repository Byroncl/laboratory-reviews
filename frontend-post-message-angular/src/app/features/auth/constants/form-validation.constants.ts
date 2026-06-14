import { Validators } from '@angular/forms';

export const AUTH_FORM_RULES = {
  USERNAME: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  FULL_NAME: {
    minLength: 2,
    maxLength: 100
  }
} as const;

export const PASSWORD_STRENGTH_LEVELS = {
  WEAK: 'weak',
  FAIR: 'fair',
  GOOD: 'good',
  STRONG: 'strong',
  VERY_STRONG: 'very-strong'
} as const;

export const PASSWORD_REGEX = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBERS: /[0-9]/,
  SPECIAL_CHARS: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
} as const;

export const AUTH_FORM_VALIDATORS = {
  USERNAME: [
    Validators.required,
    Validators.minLength(AUTH_FORM_RULES.USERNAME.minLength),
    Validators.maxLength(AUTH_FORM_RULES.USERNAME.maxLength),
    Validators.pattern(AUTH_FORM_RULES.USERNAME.pattern)
  ],
  EMAIL: [
    Validators.required,
    Validators.email,
    Validators.pattern(AUTH_FORM_RULES.EMAIL.pattern)
  ],
  PASSWORD: [
    Validators.required,
    Validators.minLength(AUTH_FORM_RULES.PASSWORD.minLength),
    Validators.maxLength(AUTH_FORM_RULES.PASSWORD.maxLength)
  ],
  CONFIRM_PASSWORD: [Validators.required],
  FULL_NAME: [
    Validators.required,
    Validators.minLength(AUTH_FORM_RULES.FULL_NAME.minLength),
    Validators.maxLength(AUTH_FORM_RULES.FULL_NAME.maxLength)
  ]
} as const;
