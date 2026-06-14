import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AUTH_VALIDATION, AUTH_MESSAGES } from '../constants/auth.constants';

@ValidatorConstraint({ name: 'isValidUsername', async: false })
@Injectable()
export class IsValidUsernameConstraint implements ValidatorConstraintInterface {
  constructor(private i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    return (
      value.length >= AUTH_VALIDATION.USERNAME_MIN_LENGTH &&
      value.length <= AUTH_VALIDATION.USERNAME_MAX_LENGTH &&
      /^[a-zA-Z0-9]+$/.test(value)
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const value = args.value as string;

    if (!value || typeof value !== 'string') {
      return this.i18nService.translate(AUTH_MESSAGES.USERNAME_STRING);
    }
    if (value.length < AUTH_VALIDATION.USERNAME_MIN_LENGTH) {
      return this.i18nService.translate(
        AUTH_MESSAGES.USERNAME_MIN_LENGTH,
        String(AUTH_VALIDATION.USERNAME_MIN_LENGTH),
      );
    }
    if (value.length > AUTH_VALIDATION.USERNAME_MAX_LENGTH) {
      return this.i18nService.translate(
        AUTH_MESSAGES.USERNAME_MAX_LENGTH,
        String(AUTH_VALIDATION.USERNAME_MAX_LENGTH),
      );
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return this.i18nService.translate(AUTH_MESSAGES.USERNAME_ALPHANUMERIC);
    }

    return 'Invalid username';
  }
}

@ValidatorConstraint({ name: 'isValidPassword', async: false })
@Injectable()
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  constructor(private i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    return (
      value.length >= AUTH_VALIDATION.PASSWORD_MIN_LENGTH &&
      value.length <= AUTH_VALIDATION.PASSWORD_MAX_LENGTH
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const value = args.value as string;

    if (!value || typeof value !== 'string') {
      return this.i18nService.translate(AUTH_MESSAGES.PASSWORD_STRING);
    }
    if (value.length < AUTH_VALIDATION.PASSWORD_MIN_LENGTH) {
      return this.i18nService.translate(
        AUTH_MESSAGES.PASSWORD_MIN_LENGTH,
        String(AUTH_VALIDATION.PASSWORD_MIN_LENGTH),
      );
    }
    if (value.length > AUTH_VALIDATION.PASSWORD_MAX_LENGTH) {
      return this.i18nService.translate(
        AUTH_MESSAGES.PASSWORD_MAX_LENGTH,
        String(AUTH_VALIDATION.PASSWORD_MAX_LENGTH),
      );
    }

    return 'Invalid password';
  }
}

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Invalid username',
        ...validationOptions,
      },
      validator: IsValidUsernameConstraint,
    });
  };
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Invalid password',
        ...validationOptions,
      },
      validator: IsValidPasswordConstraint,
    });
  };
}
