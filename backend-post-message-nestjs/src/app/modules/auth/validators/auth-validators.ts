import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isAlphanumeric,
  registerDecorator,
  ValidationOptions,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AUTH_CONFIG } from '../../../core/constants/auth.constants';

/**
 * Validator constraint for checking if username is valid.
 * Rules: alphanumeric, 3-20 characters
 */
@ValidatorConstraint({ name: 'isValidUsername', async: false })
@Injectable()
export class IsValidUsernameConstraint implements ValidatorConstraintInterface {
  constructor(private readonly i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    if (!isAlphanumeric(value)) {
      return false;
    }
    return value.length >= 3 && value.length <= 20;
  }

  defaultMessage(args: ValidationArguments): string {
    return this.i18nService.translate('validation.username_invalid');
  }
}

/**
 * Validator constraint for checking if password is valid.
 * Rules: minimum 6 characters, maximum 200 characters
 */
@ValidatorConstraint({ name: 'isValidPassword', async: false })
@Injectable()
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  constructor(private readonly i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return (
      value.length >= AUTH_CONFIG.PASSWORD_MIN_LENGTH &&
      value.length <= AUTH_CONFIG.PASSWORD_MAX_LENGTH
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return this.i18nService.translate('validation.password_invalid');
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
