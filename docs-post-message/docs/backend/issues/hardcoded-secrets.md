---
sidebar_position: 1
title: Hardcoded Secrets Issue
description: JWT secret hardcoded in source code
---

# Hardcoded Secrets ⚠️ CRITICAL

## Problem

The JWT secret is hardcoded in the source code:

**File**: `src/app/modules/auth/auth.module.ts`

```typescript
JwtModule.register({
  secret: 'yourSecretKey',  // ❌ HARDCODED!
  signOptions: { expiresIn: '24h' },
})
```

Also in **`src/app/modules/auth/strategies/jwt.strategy.ts`**:

```typescript
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: 'yourSecretKey',  // ❌ Also hardcoded!
});
```

## Risks

1. **Source code repository contains secrets** — Anyone with code access can forge tokens
2. **Same secret in all environments** — Development uses production secret
3. **Visible in git history** — Even if changed, old secret is recoverable
4. **No rotation mechanism** — Secret never changes

## Solution

### 1. Use Environment Variable

Create `.env`:
```bash
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
```

### 2. Update auth.module.ts

```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',  // ✅ From env
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
  ],
})
export class AuthModule {}
```

### 3. Update jwt.strategy.ts

```typescript
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret',  // ✅ From env
});
```

### 4. .env.example

```bash
JWT_SECRET=change-me-in-production-use-strong-random-value
JWT_EXPIRES_IN=24h
```

### 5. Generate Secure Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Implementation Steps

1. [ ] Update `auth.module.ts` to use `process.env.JWT_SECRET`
2. [ ] Update `jwt.strategy.ts` to use `process.env.JWT_SECRET`
3. [ ] Create `.env.example` with placeholder
4. [ ] Generate strong secret and set in `.env`
5. [ ] Update deployment environment variables
6. [ ] Test authentication with new secret
7. [ ] Revert old secret in git history (if using git-filter-repo)

## ConfigModule Alternative

Use NestJS ConfigModule for type-safe configuration:

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

## Verification

After fix, verify JWT secret is not hardcoded:

```bash
# Should not find hardcoded secret
grep -r "yourSecretKey" src/

# Check .env is in .gitignore
cat .gitignore | grep .env
```

---

**Severity**: 🔴 CRITICAL
**Impact**: Authentication compromise, token forgery
**Timeline**: Immediate fix required

**Next**: [Orphaned Modules →](./orphaned-modules.md)
