---
sidebar_position: 2
title: Interceptors
description: Response transformation and logging
---

# Interceptors 🔄

Interceptors transform responses and can log requests/responses.

## TransformInterceptor

Wraps all API responses in a consistent envelope:

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
        timestamp: new Date().toISOString(),
        success: true,
      })),
    );
  }
}
```

**Global Registration**:
```typescript
app.useGlobalInterceptors(new TransformInterceptor());
```

**Response Example**:
```json
{
  "statusCode": 200,
  "data": { "id": "123", "name": "John" },
  "timestamp": "2024-06-13T12:34:56.789Z",
  "success": true
}
```

## LoggingInterceptor (Optional)

Log all requests and responses:

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log(`${method} ${url} +${duration}ms`);
      }),
    );
  }
}
```

---

**Next**: [Filters →](./filters.md)
