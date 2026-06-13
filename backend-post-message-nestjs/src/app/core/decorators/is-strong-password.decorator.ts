import { registerDecorator, ValidationOptions } from 'class-validator';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

export function isStrongPassword(value: string): boolean {
  return STRONG_PASSWORD_REGEX.test(value);
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return isStrongPassword(value);
        },
        defaultMessage() {
          return 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
        },
      },
    });
  };
}
