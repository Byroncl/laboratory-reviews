---
sidebar_position: 4
title: Problema de Inconsistencia I18n
description: Dos sistemas i18n paralelos generan confusión
---

# Inconsistencia I18n ⚠️

## Problema

La aplicación tiene **dos sistemas i18n paralelos** que coexisten:

### Sistema 1: TranslationService (Singleton)

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
    // Traducir desde JSON cargado
  }
}

// Proveedor global
{
  provide: 'TRANSLATION_SERVICE',
  useClass: TranslationService,
}
```

**Usado por**: Guards, Filtros, Gateway

### Sistema 2: I18nService (Scoped por Petición)

```typescript
// src/app/core/i18n/i18n.service.ts
@Injectable()
export class I18nService {
  constructor(
    @Inject(REQUEST) private request: Request,
  ) {}

  translate(key: string) {
    const language = this.request.headers['accept-language'];
    // Traducir desde JSON cargado
  }
}

// Proveedor por módulo
{
  provide: I18nService,
  useClass: I18nService,
}
```

**Usado por**: UsersModule, I18nModule

## Problemas

1. **Confusión** — Dos servicios para el mismo propósito
2. **Inconsistencia** — Guards/Filtros usan singleton, módulos usan scoped por petición
3. **El singleton no recibe el idioma** — `setLanguage()` nunca se llama, por defecto 'en'
4. **El scoped por petición no está disponible en filtros** — Los filtros no pueden inyectar REQUEST

## Impacto

- **Mensajes de error en el idioma incorrecto** — Todos los errores siempre en inglés
- **Lógica de traducción duplicada** — Ambos servicios cargan los mismos archivos JSON
- **Sobrecarga de mantenimiento** — Los cambios deben hacerse en dos lugares

## Solución

### Opción A: Usar Scoped por Petición en Todas Partes

```typescript
// Eliminar TranslationService por completo
// Usar I18nService en todas partes

// En filtros (usar I18nMiddleware para asegurar que el idioma está disponible)
@Catch()
export class GlobalExceptionFilter {
  constructor(private i18nService: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // Ahora se puede usar i18nService
  }
}
```

**Pros**: Limpio, consciente de la petición
**Contras**: No se puede usar en guards (los guards son globales)

### Opción B: Usar Singleton con Middleware

```typescript
// Mantener TranslationService como singleton
// Pero hacer que el middleware establezca el idioma antes de que se ejecuten los guards

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  constructor(private translationService: TranslationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const language = req.headers['accept-language'] || 'en';
    this.translationService.setLanguage(language);  // ✅ Establecer antes de los manejadores
    next();
  }
}
```

**Pros**: Funciona en guards
**Contras**: Menos limpio, estado mutable

### Opción C: Híbrido - I18nService con Fallback

```typescript
@Injectable()
export class I18nService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private translationService: TranslationService,
  ) {}

  translate(key: string): string {
    try {
      // Intentar scoped por petición
      const language = this.request?.headers['accept-language'];
      return this.translationService.translate(key, language);
    } catch {
      // Fallback al singleton
      return this.translationService.translate(key);
    }
  }
}

// En filtros, usar TranslationService directamente
@Catch()
export class GlobalExceptionFilter {
  constructor(private translationService: TranslationService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const language = host.switchToHttp().getRequest()['language'];
    const message = this.translationService.translate('error.key', language);
  }
}
```

**Pros**: Funciona en todas partes, compatible con versiones anteriores
**Contras**: Siguen siendo dos servicios

## Implementación Recomendada

1. **Mantener TranslationService** (usado por guards/filtros)
2. **Actualizar I18nMiddleware** para establecer el idioma antes de los guards
3. **Deprecar I18nService** en favor de TranslationService
4. **Estandarizar el uso** en todos los módulos

```typescript
// I18nMiddleware actualizado
@Injectable()
export class I18nMiddleware implements NestMiddleware {
  constructor(private translationService: TranslationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const language = (req.headers['accept-language'] || 'en').substring(0, 2);
    this.translationService.setLanguage(language);
    req['language'] = language;  // También almacenar en la petición como referencia
    next();
  }
}
```

## Pasos de Implementación

1. [ ] Decidir el enfoque (A, B o C)
2. [ ] Consolidar el uso del servicio
3. [ ] Actualizar todos los módulos para usar un único servicio
4. [ ] Eliminar el servicio duplicado
5. [ ] Actualizar las pruebas
6. [ ] Verificar que todos los mensajes de error respetan el idioma

## Pruebas

```typescript
it('should return error in Spanish', () => {
  const response = await request(app.getHttpServer())
    .get('/invalid')
    .set('Accept-Language', 'es')
    .expect(404);

  expect(response.body.message).toContain('no encontrado');  // Español
});
```

---

**Gravedad**: 🟡 MEDIA
**Impacto**: Código confuso, difícil de mantener
**Plazo**: Debería refactorizarse en el próximo sprint

---

**Resumen**: Ver [Descripción General de Problemas Conocidos](./README.md)
