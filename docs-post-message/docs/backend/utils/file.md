---
sidebar_position: 2
title: File Utilities
description: File handling and naming
---

# File Utilities 📄

Utilities for file operations and MinIO integration.

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

**Location**: `src/app/core/utils/file.utils.ts`

## Usage

### File Upload

```typescript
const fileName = FileUtils.generateFileName(file.originalname);
// Result: '1718281696123-a7k9x2.jpg'

const isValid = FileUtils.validateFileSize(file.size);
const isImage = FileUtils.isImageFile(file.mimetype);
```

---

**Next**: [String Utilities →](./string.md)
