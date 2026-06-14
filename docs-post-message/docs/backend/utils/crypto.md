---
sidebar_position: 1
title: Crypto Utilities
description: Password hashing and verification
---

# Crypto Utilities 🔐

Utilities for password hashing and verification using bcrypt.

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

**Location**: `src/app/core/utils/crypto.utils.ts`

## Usage

### In Auth Service

```typescript
const hashedPassword = await this.cryptoUtils.hashPassword(plainPassword);

const isValid = await this.cryptoUtils.comparePasswords(
  plainPassword,
  hashedPassword,
);
```

### In User Creation

```typescript
const hashedPassword = await this.cryptoUtils.hashPassword(dto.password);

const user = await this.userRepository.create({
  ...dto,
  password_hash: hashedPassword,  // Store hashed password
});
```

## Security Best Practices

1. **Never store plain text passwords** — Always hash
2. **Use strong salt** — 10+ rounds
3. **Verify on login** — Use `comparePasswords()`
4. **Password policy** — Enforce strong passwords with `@IsStrongPassword()`

---

**Next**: [File Utilities →](./file.md)
