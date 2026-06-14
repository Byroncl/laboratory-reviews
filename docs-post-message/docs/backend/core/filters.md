---
sidebar_position: 3
title: Filtros de Excepción
description: Manejo global de excepciones
---

# Filtros de Excepción ❌

Los filtros capturan excepciones globalmente y formatean las respuestas de error.

## GlobalExceptionFilter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private translationService: TranslationService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const language = request['language'] || 'en';

    let statusCode = 500;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.getResponse()['message'] || exception.message;
      errors = exception.getResponse()['errors'];
    }

    response.status(statusCode).json({
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      success: false,
    });
  }
}
```

**Registro Global**:
```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new GlobalExceptionFilter(translationService));
```

## Manejo de Excepciones

```typescript
// BadRequestException
throw new BadRequestException('Invalid input');

// NotFoundException
throw new NotFoundException('User not found');

// UnauthorizedException
throw new UnauthorizedException('Invalid token');

// ForbiddenException
throw new ForbiddenException('Access denied');

// ConflictException
throw new ConflictException('Username already exists');

// InternalServerErrorException
throw new InternalServerErrorException('Database error');
```

---

**Siguiente**: [Decoradores →](./decorators.md)
