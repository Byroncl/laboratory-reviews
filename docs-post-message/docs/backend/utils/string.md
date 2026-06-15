---
sidebar_position: 3
title: Utilidades de Strings
description: Helpers de manipulación de cadenas
---

# Utilidades de Strings 📝

Utilidades de manipulación y formateo de cadenas.

## StringUtils

```typescript
export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  static truncate(str: string, length: number, suffix = '...'): string {
    return str.length > length ? str.substring(0, length) + suffix : str;
  }

  static trim(str: string): string {
    return str.trim();
  }
}
```

---

**Siguiente**: [Utilidades de Validación →](./validation.md)
