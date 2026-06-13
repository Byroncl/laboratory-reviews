---
sidebar_position: 4
title: Validation Utilities
description: Input validation helpers
---

# Validation Utilities ✅

Shared validation logic for common checks.

## ValidationUtils

```typescript
export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  }

  static isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 30;
  }

  static isMongoObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
  }
}
```

## Decorators

### @IsStrongPassword()

```typescript
export function IsStrongPassword() {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: target.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: string) {
          return ValidationUtils.isStrongPassword(value);
        },
        defaultMessage() {
          return 'Password must be 8+ chars with uppercase, lowercase, number, special char';
        },
      },
    });
  };
}
```

---

**Next**: [Database Relationships →](../database/relationships.md)
