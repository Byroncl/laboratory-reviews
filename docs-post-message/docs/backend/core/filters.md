---
sidebar_position: 3
title: Exception Filters
description: Global exception handling
---

# Exception Filters ❌

Filters catch exceptions globally and format error responses.

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

**Global Registration**:
```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new GlobalExceptionFilter(translationService));
```

## Exception Handling

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

**Next**: [Decorators →](./decorators.md)
