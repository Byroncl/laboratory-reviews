import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { I18nService } from '../../../core/i18n/i18n.service';
import { COMMENTS_CONFIG, ALLOWED_EMOJIS } from '../constants/comments.constants';
import { isValidObjectId } from 'mongoose';

/**
 * Validator constraint for checking if comment content is valid.
 * Rules: min 1 char, max 5000 chars
 */
@ValidatorConstraint({ name: 'isValidCommentContent', async: false })
@Injectable()
export class IsValidCommentContentConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return (
      value.length >= COMMENTS_CONFIG.CONTENT_MIN_LENGTH &&
      value.length <= COMMENTS_CONFIG.CONTENT_MAX_LENGTH
    );
  }

  defaultMessage(): string {
    return this.i18nService.translate('validation.comment_content_invalid');
  }
}

/**
 * Validator constraint for checking if post ID is valid MongoDB ObjectId.
 */
@ValidatorConstraint({ name: 'isValidPostId', async: false })
@Injectable()
export class IsValidPostIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return isValidObjectId(value);
  }

  defaultMessage(): string {
    return this.i18nService.translate('validation.post_id_invalid');
  }
}

/**
 * Validator constraint for checking if emoji is allowed.
 */
@ValidatorConstraint({ name: 'isValidEmoji', async: false })
@Injectable()
export class IsValidEmojiConstraint implements ValidatorConstraintInterface {
  constructor(private readonly i18nService: I18nService) {}

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    return (ALLOWED_EMOJIS as readonly string[]).includes(value);
  }

  defaultMessage(): string {
    return this.i18nService.translate('comments.invalid_emoji');
  }
}

/**
 * Decorator for validating comment content
 */
export function IsValidCommentContent(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCommentContentConstraint,
    });
  };
}

/**
 * Decorator for validating post ID
 */
export function IsValidPostId(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPostIdConstraint,
    });
  };
}

/**
 * Decorator for validating emoji
 */
export function IsValidEmoji(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidEmojiConstraint,
    });
  };
}
