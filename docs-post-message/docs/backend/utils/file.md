---
sidebar_position: 2
title: Utilidades de Archivos
description: Manejo de archivos y nomenclatura
---

# Utilidades de Archivos 📄

Utilidades para operaciones con archivos e integración con MinIO.

## FileUtils

```typescript
export class FileUtils {
  static generateFileName(originalName: string): string {
    const extension = originalName.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${timestamp}-${random}.${extension}`;
  }

  static validateFileSize(size: number, maxSize: number = 5 * 1024 * 1024): boolean {
    return size <= maxSize;
  }

  static isImageFile(mimetype: string): boolean {
    return ['image/jpeg', 'image/png', 'image/gif'].includes(mimetype);
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }
}
```

**Ubicación**: `src/app/core/utils/file.utils.ts`

## Uso

### Subida de Archivos

```typescript
const fileName = FileUtils.generateFileName(file.originalname);
// Resultado: '1718281696123-a7k9x2.jpg'

const isValid = FileUtils.validateFileSize(file.size);
const isImage = FileUtils.isImageFile(file.mimetype);
```

---

**Siguiente**: [Utilidades de Strings →](./string.md)
