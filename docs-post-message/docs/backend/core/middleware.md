---
sidebar_position: 5
title: Middleware
description: Preprocesamiento de peticiones
---

# Middleware 🛣️

El middleware procesa las peticiones antes de que lleguen a los manejadores.

## I18nMiddleware

Detecta y establece el idioma de la petición:

```typescript
@Injectable()
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const language = req.headers['accept-language'] || 'en';
    req['language'] = language.substring(0, 2);  // 'en-US' → 'en'
    next();
  }
}
```

**Registro**:
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(I18nMiddleware)
      .forRoutes('*');  // Aplicar a todas las rutas
  }
}
```

---

**Siguiente**: [Schemas de Base de Datos →](../database/schemas.md)
