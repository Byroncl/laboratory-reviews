# Environment Variables Guide

The backend loads configuration at runtime from a `.env` file via `@nestjs/config`. The frontend uses **compile-time** environment files — there are no runtime env vars for Angular.

---

## Backend Variables

The backend reads these variables from `backend-post-message-nestjs/.env` (or the process environment when running in Docker).

| Name | Default | Description | Required |
|---|---|---|---|
| `HOST` | `localhost` | Bind address for the HTTP server | No |
| `PORT` | `3000` | HTTP port | No |
| `APP_NAME` | `My App` | Application display name | No |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) | No |
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection URI | Yes |
| `JWT_SECRET` | `secret` | JWT signing key — **MUST be changed in production** | Yes |
| `JWT_EXPIRES_IN` | `1d` | JWT token expiry (e.g. `1d`, `7d`, `1h`) | No |
| `MINIO_ENDPOINT` | `minio` | MinIO server hostname | Yes |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key | Yes |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key — **MUST be changed in production** | Yes |
| `MINIO_BUCKET_NAME` | `posts` | MinIO bucket used for file uploads | Yes |
| `MINIO_PUBLIC_URL` | `http://minio:9000` | Base URL for public file access | Yes |
| `SEED_ENABLED` | `false` | Seed the database with sample data on startup | No |
| `TESTING` | `false` | Enables testing-mode behavior in the app | No |
| `AUDIT_LOG_TTL_DAYS` | `90` | Number of days before audit log entries expire | No |

### Sample `.env` for Local Development

Create this file at `backend-post-message-nestjs/.env`:

```bash
HOST=localhost
PORT=3000
APP_NAME=Post-Message
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/post-message

JWT_SECRET=change-me-before-production
JWT_EXPIRES_IN=1d

MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=posts
MINIO_PUBLIC_URL=http://localhost:9000

SEED_ENABLED=false
TESTING=false
AUDIT_LOG_TTL_DAYS=90
```

---

## Docker Compose Variables

`docker-compose.yml` at the repo root uses `${VAR}` substitution. Create a `.env` file **at the repo root** (not inside any subdirectory) with the following:

```bash
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=change-in-production
MONGO_DB_NAME=post-message

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=change-in-production
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=change-in-production
MINIO_BUCKET_NAME=posts
```

| Variable | Example | Purpose |
|---|---|---|
| `MONGO_ROOT_USER` | `admin` | MongoDB root username |
| `MONGO_ROOT_PASSWORD` | — | MongoDB root password (change in production) |
| `MONGO_DB_NAME` | `post-message` | Database name |
| `MINIO_ROOT_USER` | `minioadmin` | MinIO root username |
| `MINIO_ROOT_PASSWORD` | — | MinIO root password (change in production) |
| `MINIO_ENDPOINT` | `minio` | MinIO service hostname (Docker internal) |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key forwarded to the NestJS app |
| `MINIO_SECRET_KEY` | — | MinIO secret key forwarded to the NestJS app (change in production) |
| `MINIO_BUCKET_NAME` | `posts` | Bucket name forwarded to the NestJS app |

---

## Frontend Environment

The Angular frontend has **no runtime environment variables**. Configuration is baked in at build time via file replacement.

Source files:

- `frontend-post-message-angular/src/environments/environment.ts` — local development
- `frontend-post-message-angular/src/environments/environment.docker.ts` — Docker build

**Development (`environment.ts`)**:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
};
```

**Docker (`environment.docker.ts`)**:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://host.docker.internal:3000/api',
  socketUrl: 'http://host.docker.internal:3000',
};
```

To add a new environment, create a new `environment.*.ts` file and register the file replacement in `angular.json` under `configurations`.

---

## Environment Matrix

| Variable | Local Dev | Docker | Production |
|---|---|---|---|
| `NODE_ENV` | `development` | `development` | `production` |
| `MONGODB_URI` | `mongodb://localhost:27017/...` | `mongodb://user:pass@mongodb:27017/...` | Managed URI |
| `JWT_SECRET` | any string | must be set via env | Secrets manager |
| `MINIO_ENDPOINT` | `localhost` | `minio` (internal) | Managed endpoint |
| `SEED_ENABLED` | `false` | `true` (docker-compose) | `false` |
| `TESTING` | `false` | `true` (docker-compose) | `false` |
| Frontend `apiUrl` | `http://localhost:3000/api` | `http://host.docker.internal:3000/api` | Production URL |

---

## Security Notes

- **Never commit `.env` files.** Add both `backend-post-message-nestjs/.env` and the root `.env` to `.gitignore`.
- **JWT_SECRET is currently hardcoded** in `backend-post-message-nestjs/src/app/modules/auth/auth.module.ts`. This is a known issue that must be fixed before any production deployment. The `JWT_SECRET` env var should be the only source of truth.
- **MinIO default credentials** (`minioadmin` / `minioadmin`) must be replaced with strong credentials in any environment beyond local development.
- **In production**, use Docker secrets, AWS Secrets Manager, HashiCorp Vault, or an equivalent solution — never plain `.env` files on the server.
