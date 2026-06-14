import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isAlphanumeric,
  isLength,
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
    if (!isAlphanumeric(value)) {
      return false;
    }
    return isLength(value, { min: 3, max: 20 });
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
    return isLength(value, {
      min: AUTH_CONFIG.PASSWORD_MIN_LENGTH,
      max: AUTH_CONFIG.PASSWORD_MAX_LENGTH,
    });
  }

  defaultMessage(args: ValidationArguments): string {
    return this.i18nService.translate('validation.password_invalid');
  }
}
