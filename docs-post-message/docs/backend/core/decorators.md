---
sidebar_position: 4
title: Decoradores Personalizados
description: Protección de rutas y extracción de metadatos
---

# Decoradores Personalizados 🎯

Los decoradores personalizados extienden la funcionalidad de NestJS para autenticación y extracción de parámetros.

## Decorador @Auth()

Marca las rutas como protegidas y establece los requisitos de rol:

```typescript
export function Auth(options?: { roles?: UserType[] }) {
  return applyDecorators(
    SetMetadata(AUTH_KEY, options?.roles),
    ApiBearerAuth(),  // Documentación Swagger
  );
}
```

**Uso**:
```typescript
@Get('profile')
@Auth()  // Protegido - cualquier usuario autenticado
getProfile() { }

@Get('admin')
@Auth({ roles: ['admin'] })  // Protegido - solo admin
getAdmin() { }
```

## Decorador @CurrentUser()

Extrae el usuario actual de la petición:

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Uso**:
```typescript
@Get('profile')
@Auth()
getProfile(@CurrentUser() user: CurrentUserPayload) {
  return user;  // { userId, type, role }
}
```

## Decorador @HasPermission()

Comprueba permisos específicos:

```typescript
export function HasPermission(permission: string) {
  return SetMetadata(PERMISSION_KEY, permission);
}
```

**Uso**:
```typescript
@Delete(':id')
@Auth()
@HasPermission('posts:delete')
deletePost(@Param('id') id: string) { }
```

## Validador @IsStrongPassword()

Decorador personalizado de class-validator:

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

**Uso**:
```typescript
export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}
```

## Crear Decoradores Personalizados

**Plantilla**:
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

**Siguiente**: [Middleware →](./middleware.md)
