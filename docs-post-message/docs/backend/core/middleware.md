---
sidebar_position: 5
title: Middleware
description: Request pre-processing
---

# Middleware 🛣️

Middleware processes requests before they reach handlers.

## I18nMiddleware

Detects and sets the request language:

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

**Registration**:
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(I18nMiddleware)
      .forRoutes('*');  // Apply to all routes
  }
}
```

---

**Next**: [Database Schemas →](../database/schemas.md)
