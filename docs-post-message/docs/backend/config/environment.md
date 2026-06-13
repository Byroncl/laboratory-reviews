---
sidebar_position: 1
title: Environment Variables
description: Configuration and environment setup
---

# Environment Variables ⚙️

The backend uses environment variables for configuration.

## Variables

| Variable | Default | Purpose | Required |
|----------|---------|---------|----------|
| `HOST` | `localhost` | Bind address | ✅ |
| `PORT` | `3000` | HTTP port | ✅ |
| `APP_NAME` | `My App` | Application name | ✅ |
| `NODE_ENV` | `development` | Environment | ✅ |
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection | ✅ |
| `JWT_SECRET` | `secret` | JWT signing key | ⚠️ Hardcoded |
| `JWT_EXPIRES_IN` | `1d` | Token expiry | ✅ |
| `MINIO_ENDPOINT` | `minio` | MinIO server | ✅ |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO credentials | ✅ |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO credentials | ✅ |
| `MINIO_BUCKET_NAME` | `posts` | MinIO bucket | ✅ |
| `MINIO_PUBLIC_URL` | `http://minio:9000` | File access URL | ✅ |

## .env File Example

```bash
# Server
HOST=localhost
PORT=3000
APP_NAME=Post-Message
NODE_ENV=development

# Database
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

## Environment Files

- `.env` — Local development
- `.env.production` — Production overrides
- `config/env/default.ts` — Default fallbacks
- `config/env/production.ts` — Production config

## Docker Environment

```yaml
environment:
  - HOST=0.0.0.0
  - PORT=3000
  - MONGODB_URI=mongodb://mongo:27017/post-message
  - MINIO_ENDPOINT=minio
  - MINIO_ACCESS_KEY=minioadmin
  - MINIO_SECRET_KEY=minioadmin
```

## Security Notes ⚠️

1. **JWT_SECRET is hardcoded** in `auth.module.ts` — should use env var
2. **MinIO credentials are defaults** — change in production
3. **No HTTPS in development** — enable in production

See [Hardcoded Secrets Issue](../issues/hardcoded-secrets.md)

---

**Next**: [Setup →](./setup.md)
