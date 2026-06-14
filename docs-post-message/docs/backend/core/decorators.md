---
sidebar_position: 4
title: Custom Decorators
description: Route protection and metadata extraction
---

# Custom Decorators 🎯

Custom decorators extend NestJS functionality for authentication and parameter extraction.

## @Auth() Decorator

Marks routes as protected and sets role requirements:

```typescript
export function Auth(options?: { roles?: UserType[] }) {
  return applyDecorators(
    SetMetadata(AUTH_KEY, options?.roles),
    ApiBearerAuth(),  // Swagger documentation
  );
}
```

**Usage**:
```typescript
@Get('profile')
@Auth()  // Protected - any authenticated user
getProfile() { }

@Get('admin')
@Auth({ roles: ['admin'] })  // Protected - admin only
getAdmin() { }
```

## @CurrentUser() Decorator

Extracts the current user from the request:

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Usage**:
```typescript
@Get('profile')
@Auth()
getProfile(@CurrentUser() user: CurrentUserPayload) {
  return user;  // { userId, type, role }
}
```

## @HasPermission() Decorator

Checks for specific permissions:

```typescript
export function HasPermission(permission: string) {
  return SetMetadata(PERMISSION_KEY, permission);
}
```

**Usage**:
```typescript
@Delete(':id')
@Auth()
@HasPermission('posts:delete')
deletePost(@Param('id') id: string) { }
```

## @IsStrongPassword() Validator

Custom class-validator decorator:

```typescript
export function IsStrongPassword() {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: target.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: string) {
          const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
          return regex.test(value);
        },
        defaultMessage() {
          return 'Password must be 8+ chars with uppercase, lowercase, number, special char';
        },
      },
    });
  };
}
```

**Usage**:
```typescript
export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}
```

## Creating Custom Decorators

**Template**:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MyDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.customData;
  },
);
```

---

**Next**: [Middleware →](./middleware.md)
