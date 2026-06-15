import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isAlphanumeric,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { AUTH_CONFIG } from '../../../core/constants/auth.constants';

/**
 * Validator constraint for checking if username is valid.
 * Rules: alphanumeric, 3-20 characters
 */
@ValidatorConstraint({ name: 'isValidUsername', async: false })
export class IsValidUsernameConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    if (!isAlphanumeric(value)) {
      return false;
    }
    return value.length >= 3 && value.length <= 20;
  }

  defaultMessage(): string {
    return 'Username must be alphanumeric and between 3-20 characters';
  }
}

/**
 * Validator constraint for checking if password is valid.
 * Rules: minimum 6 characters, maximum 200 characters
 */
@ValidatorConstraint({ name: 'isValidPassword', async: false })
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return (
      value.length >= AUTH_CONFIG.PASSWORD_MIN_LENGTH &&
      value.length <= AUTH_CONFIG.PASSWORD_MAX_LENGTH
    );
  }

  defaultMessage(): string {
    return `Password must be between ${AUTH_CONFIG.PASSWORD_MIN_LENGTH}-${AUTH_CONFIG.PASSWORD_MAX_LENGTH} characters`;
  }
}

/**
 * Decorator for validating username
 */
export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUsernameConstraint,
    });
  };
}

/**
 * Decorator for validating password
 */
export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    });
  };
}
