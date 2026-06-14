---
sidebar_position: 4
title: I18n Inconsistency Issue
description: Two parallel i18n systems cause confusion
---

# I18n Inconsistency ⚠️

## Problem

The application has **two parallel i18n systems** that coexist:

### System 1: TranslationService (Singleton)

```typescript
// src/app/core/utils/translation.service.ts
@Injectable()
export class TranslationService {
  private language: string = 'en';

  setLanguage(lang: string) {
    this.language = lang;
  }

  translate(key: string, lang?: string, ...args: any[]) {
    const language = lang || this.language;
    // Translate from loaded JSON
  }
}

// Global provider
{
  provide: 'TRANSLATION_SERVICE',
  useClass: TranslationService,
}
```

**Used by**: Guards, Filters, Gateway

### System 2: I18nService (Request-Scoped)

```typescript
// src/app/core/i18n/i18n.service.ts
@Injectable()
export class I18nService {
  constructor(
    @Inject(REQUEST) private request: Request,
  ) {}

  translate(key: string) {
    const language = this.request.headers['accept-language'];
    // Translate from loaded JSON
  }
}

// Per-module provider
{
  provide: I18nService,
  useClass: I18nService,
}
```

**Used by**: UsersModule, I18nModule

## Problems

1. **Confusion** — Two services for same purpose
2. **Inconsistency** — Guards/Filters use singleton, modules use request-scoped
3. **Singleton doesn't get language** — `setLanguage()` never called, defaults to 'en'
4. **Request-scoped not available in filters** — Filters can't inject REQUEST

## Impact

- **Error messages in wrong language** — All errors always in English
- **Translation logic duplicated** — Both services load same JSON files
- **Maintenance overhead** — Changes needed in two places

## Solution

### Option A: Use Request-Scoped Everywhere

```typescript
// Remove TranslationService entirely
// Use I18nService everywhere

// In filters (use I18nMiddleware to ensure language is available)
@Catch()
export class GlobalExceptionFilter {
  constructor(private i18nService: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // Can now use i18nService
  }
}
```

**Pros**: Clean, request-aware
**Cons**: Can't use in guards (guards are global)

### Option B: Use Singleton with Middleware

```typescript
// Keep TranslationService as singleton
// But have middleware set language before guards run

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  constructor(private translationService: TranslationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const language = req.headers['accept-language'] || 'en';
    this.translationService.setLanguage(language);  // ✅ Set before handlers
    next();
  }
}
```

**Pros**: Works in guards
**Cons**: Less clean, mutable state

### Option C: Hybrid - I18nService with Fallback

```typescript
@Injectable()
export class I18nService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private translationService: TranslationService,
  ) {}

  translate(key: string): string {
    try {
      // Try request-scoped
      const language = this.request?.headers['accept-language'];
      return this.translationService.translate(key, language);
    } catch {
      // Fallback to singleton
      return this.translationService.translate(key);
    }
  }
}

// In filters, use TranslationService directly
@Catch()
export class GlobalExceptionFilter {
  constructor(private translationService: TranslationService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const language = host.switchToHttp().getRequest()['language'];
    const message = this.translationService.translate('error.key', language);
  }
}
```

**Pros**: Works everywhere, backward compatible
**Cons**: Still two services

## Recommended Implementation

1. **Keep TranslationService** (used by guards/filters)
2. **Update I18nMiddleware** to set language before guards
3. **Deprecate I18nService** in favor of TranslationService
4. **Standardize usage** across all modules

```typescript
// Updated I18nMiddleware
@Injectable()
export class I18nMiddleware implements NestMiddleware {
  constructor(private translationService: TranslationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const language = (req.headers['accept-language'] || 'en').substring(0, 2);
    this.translationService.setLanguage(language);
    req['language'] = language;  // Also store on request for reference
    next();
  }
}
```

## Implementation Steps

1. [ ] Decide on approach (A, B, or C)
2. [ ] Consolidate service usage
3. [ ] Update all modules to use single service
4. [ ] Remove duplicate service
5. [ ] Update tests
6. [ ] Verify all error messages respect language

## Testing

```typescript
it('should return error in Spanish', () => {
  const response = await request(app.getHttpServer())
    .get('/invalid')
    .set('Accept-Language', 'es')
    .expect(404);

  expect(response.body.message).toContain('no encontrado');  // Spanish
});
```

---

**Severity**: 🟡 MEDIUM
**Impact**: Confusing codebase, hard to maintain
**Timeline**: Should be refactored in next sprint

---

**Summary**: See [Known Issues Overview](./README.md)
