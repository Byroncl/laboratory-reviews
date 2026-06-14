---
sidebar_position: 1
title: Problema de Secretos Hardcodeados
description: El secreto JWT está hardcodeado en el código fuente
---

# Secretos Hardcodeados ⚠️ CRÍTICO

## Problema

El secreto JWT está hardcodeado en el código fuente:

**Archivo**: `src/app/modules/auth/auth.module.ts`

```typescript
JwtModule.register({
  secret: 'yourSecretKey',  // ❌ ¡HARDCODEADO!
  signOptions: { expiresIn: '24h' },
})
```

También en **`src/app/modules/auth/strategies/jwt.strategy.ts`**:

```typescript
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: 'yourSecretKey',  // ❌ ¡También hardcodeado aquí!
});
```

## Riesgos

1. **El repositorio de código fuente contiene secretos** — Cualquier persona con acceso al código puede falsificar tokens
2. **El mismo secreto en todos los entornos** — Desarrollo usa el secreto de producción
3. **Visible en el historial de git** — Aunque se cambie, el secreto anterior es recuperable
4. **Sin mecanismo de rotación** — El secreto nunca cambia

## Solución

### 1. Usar Variable de Entorno

Crear `.env`:
```bash
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
```

### 2. Actualizar auth.module.ts

```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',  // ✅ Desde env
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
  ],
})
export class AuthModule {}
```

### 3. Actualizar jwt.strategy.ts

```typescript
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret',  // ✅ Desde env
});
```

### 4. .env.example

```bash
JWT_SECRET=change-me-in-production-use-strong-random-value
JWT_EXPIRES_IN=24h
```

### 5. Generar Secreto Seguro

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Pasos de Implementación

1. [ ] Actualizar `auth.module.ts` para usar `process.env.JWT_SECRET`
2. [ ] Actualizar `jwt.strategy.ts` para usar `process.env.JWT_SECRET`
3. [ ] Crear `.env.example` con placeholder
4. [ ] Generar secreto fuerte y configurar en `.env`
5. [ ] Actualizar variables de entorno de despliegue
6. [ ] Probar autenticación con el nuevo secreto
7. [ ] Revertir secreto anterior en historial de git (si se usa git-filter-repo)

## Alternativa con ConfigModule

Usar el ConfigModule de NestJS para configuración con tipos seguros:

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}

// auth.module.ts
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
    }),
  ],
})
export class AuthModule {}
```

## Verificación

Después de la corrección, verificar que el secreto JWT no está hardcodeado:

```bash
# No debería encontrar el secreto hardcodeado
grep -r "yourSecretKey" src/

# Verificar que .env está en .gitignore
cat .gitignore | grep .env
```

---

**Gravedad**: 🔴 CRÍTICO
**Impacto**: Compromiso de autenticación, falsificación de tokens
**Plazo**: Corrección inmediata requerida

**Siguiente**: [Módulos Huérfanos →](./orphaned-modules.md)
