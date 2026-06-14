import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { I18nService } from '../../../core/i18n/i18n.service';
import { isValidObjectId } from 'mongoose';

/**
 * Validator constraint for checking if post ID is valid MongoDB ObjectId.
 */
@ValidatorConstraint({ name: 'isValidFavoritePostId', async: false })
@Injectable()
export class IsValidFavoritePostIdConstraint
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
    return this.i18nService.translate('favorites.validation_post_id_invalid');
  }
}

/**
 * Decorator for validating favorite post ID
 */
export function IsValidFavoritePostId(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidFavoritePostIdConstraint,
    });
  };
}
