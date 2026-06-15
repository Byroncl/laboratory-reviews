import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ROLES_CONFIG } from '../constants/roles.constants';
import { isValidObjectId } from 'mongoose';

/**
 * Validator constraint for checking if role name is valid.
 * Rules: 2-100 characters, can include spaces
 */
@ValidatorConstraint({ name: 'isValidRoleName', async: false })
@Injectable()
export class IsValidRoleNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return (
      value.length >= ROLES_CONFIG.NAME_MIN_LENGTH &&
      value.length <= ROLES_CONFIG.NAME_MAX_LENGTH
    );
  }

  defaultMessage(): string {
    return this.i18nService.translate('roles.validation_name_invalid');
  }
}

/**
 * Validator constraint for checking if permission ID is valid MongoDB ObjectId.
 */
@ValidatorConstraint({ name: 'isValidPermissionId', async: false })
@Injectable()
export class IsValidPermissionIdConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return isValidObjectId(value);
  }

  defaultMessage(): string {
    return this.i18nService.translate('roles.validation_permission_id_invalid');
  }
}

/**
 * Decorator for validating role name
 */
export function IsValidRoleName(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRoleNameConstraint,
    });
  };
}

/**
 * Decorator for validating permission ID
 */
export function IsValidPermissionId(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPermissionIdConstraint,
    });
  };
}
