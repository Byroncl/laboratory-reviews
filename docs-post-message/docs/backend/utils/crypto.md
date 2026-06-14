---
sidebar_position: 1
title: Utilidades Crypto
description: Hasheo y verificación de contraseñas
---

# Utilidades Crypto 🔐

Utilidades para hasheo y verificación de contraseñas usando bcrypt.

## CryptoUtils

```typescript
@Injectable()
export class CryptoUtils {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
```

**Ubicación**: `src/app/core/utils/crypto.utils.ts`

## Uso

### En el Servicio Auth

```typescript
const hashedPassword = await this.cryptoUtils.hashPassword(plainPassword);

const isValid = await this.cryptoUtils.comparePasswords(
  plainPassword,
  hashedPassword,
);
```

### En la Creación de Usuario

```typescript
const hashedPassword = await this.cryptoUtils.hashPassword(dto.password);

const user = await this.userRepository.create({
  ...dto,
  password_hash: hashedPassword,  // Almacenar contraseña hasheada
});
```

## Buenas Prácticas de Seguridad

1. **Nunca almacenar contraseñas en texto plano** — Siempre hashear
2. **Usar salt fuerte** — 10+ rondas
3. **Verificar en el login** — Usar `comparePasswords()`
4. **Política de contraseñas** — Aplicar contraseñas fuertes con `@IsStrongPassword()`

---

**Siguiente**: [Utilidades de Archivos →](./file.md)
