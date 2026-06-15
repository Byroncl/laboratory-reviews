---
sidebar_position: 2
title: Interceptores
description: Transformación de respuestas y logging
---

# Interceptores 🔄

Los interceptores transforman respuestas y pueden registrar peticiones/respuestas.

## TransformInterceptor

Envuelve todas las respuestas de la API en un envelope consistente:

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

**Registro Global**:
```typescript
app.useGlobalInterceptors(new TransformInterceptor());
```

**Ejemplo de Respuesta**:
```json
{
  "statusCode": 200,
  "data": { "id": "123", "name": "John" },
  "timestamp": "2024-06-13T12:34:56.789Z",
  "success": true
}
```

## LoggingInterceptor (Opcional)

Registrar todas las peticiones y respuestas:

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

**Siguiente**: [Filtros →](./filters.md)
