---
sidebar_position: 1
title: Variables de Entorno
description: Configuración y configuración del entorno
---

# Variables de Entorno ⚙️

El backend utiliza variables de entorno para la configuración.

## Variables

| Variable | Por Defecto | Propósito | Requerido |
|----------|---------|---------|----------|
| `HOST` | `localhost` | Dirección de enlace | ✅ |
| `PORT` | `3000` | Puerto HTTP | ✅ |
| `APP_NAME` | `My App` | Nombre de la aplicación | ✅ |
| `NODE_ENV` | `development` | Entorno | ✅ |
| `MONGODB_URI` | `mongodb://localhost:27017` | Conexión a MongoDB | ✅ |
| `JWT_SECRET` | `secret` | Clave de firma JWT | ⚠️ Hardcodeada |
| `JWT_EXPIRES_IN` | `1d` | Expiración del token | ✅ |
| `MINIO_ENDPOINT` | `minio` | Servidor MinIO | ✅ |
| `MINIO_ACCESS_KEY` | `minioadmin` | Credenciales MinIO | ✅ |
| `MINIO_SECRET_KEY` | `minioadmin` | Credenciales MinIO | ✅ |
| `MINIO_BUCKET_NAME` | `posts` | Bucket MinIO | ✅ |
| `MINIO_PUBLIC_URL` | `http://minio:9000` | URL de acceso a archivos | ✅ |

## Ejemplo de Archivo .env

```bash
# Servidor
HOST=localhost
PORT=3000
APP_NAME=Post-Message
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/post-message

# JWT
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# MinIO
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=posts
MINIO_PUBLIC_URL=http://localhost:9000
```

## Archivos de Entorno

- `.env` — Desarrollo local
- `.env.production` — Overrides de producción
- `config/env/default.ts` — Valores por defecto
- `config/env/production.ts` — Configuración de producción

## Entorno Docker

```yaml
environment:
  - HOST=0.0.0.0
  - PORT=3000
  - MONGODB_URI=mongodb://mongo:27017/post-message
  - MINIO_ENDPOINT=minio
  - MINIO_ACCESS_KEY=minioadmin
  - MINIO_SECRET_KEY=minioadmin
```

## Notas de Seguridad ⚠️

1. **JWT_SECRET está hardcodeado** en `auth.module.ts` — debería usar variable de entorno
2. **Las credenciales de MinIO son las por defecto** — cambiar en producción
3. **Sin HTTPS en desarrollo** — habilitarlo en producción

Ver [Problema de Secretos Hardcodeados](../issues/hardcoded-secrets.md)

---

**Siguiente**: [Configuración →](./setup.md)
