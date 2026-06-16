---
sidebar_position: 1
title: Setup & Configuration
description: How to install, configure, and run the NestJS backend locally.
---

# Setup & Configuration

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20+ recommended, 22 in Docker | LTS release |
| npm | 9+ | Bundled with Node.js |
| MongoDB | 4.4+ | Local install or Docker |
| MinIO | Any recent | Optional for local dev |
| Docker | 24+ | Optional — see [Docker guide](../deployment/docker.md) |

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd backend-post-message-nestjs

# 2. Install dependencies
npm install

# 3. Copy the example env file
cp .env.example .env

# 4. Edit .env with your values
```

---

## Environment Variables

Create a `.env` file at `backend-post-message-nestjs/.env`. Below is the full reference with safe defaults for local development.

```dotenv
# Server
HOST=localhost
PORT=3000
APP_NAME=PostMessage
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/postmessage

# JWT
# WARNING: Change JWT_SECRET before deploying to any shared environment.
# The current auth.module.ts hardcodes a fallback — always set this explicitly.
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=1d

# MinIO (file storage)
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=posts
MINIO_PUBLIC_URL=http://localhost:9000

# Optional
SEED_ENABLED=false
TESTING=false
AUDIT_LOG_TTL_DAYS=90
```

> **JWT_SECRET warning:** `auth.module.ts` contains a hardcoded fallback value. Always set `JWT_SECRET` explicitly. Never rely on the fallback outside of local development.

Full variable reference is documented in [Environment Variables](../config/environment.md).

---

## Running Locally

### Development (hot-reload)

```bash
npm run dev
```

The server starts at `http://localhost:3000` and reloads automatically on file changes.

### Debug mode

```bash
npm run start:debug
```

Attaches a Node.js inspector on the default port (9229).

### Production

```bash
# Build TypeScript
npm run build

# Start compiled output
npm run start:prod
```

The compiled output is placed in `dist/`. The production entry point is `dist/main.js`.

---

## Database Seeding

There is no separate seed command. Set `SEED_ENABLED=true` in `.env` and start the server — the seed runs automatically on startup.

```dotenv
SEED_ENABLED=true
```

> Reset the database and restart to re-run the seed. The seed is idempotent — running it on an already-seeded database is safe.

---

## Test Credentials

When `SEED_ENABLED=true`, the database is populated with test users. All test users have the password **`password123`**.

### Admin Users (can access the dashboard)

| Username | Email | Role | Notes |
|---|---|---|---|
| `charlie` | charlie@example.com | admin | Full permissions |
| `bianca` | bianca@example.com | admin | Full permissions |

### Regular Users (can post, comment)

| Username | Email | Role |
|---|---|---|
| `sofi` | sofi@example.com | user |
| `joselin` | joselin@example.com | user |
| `bibi` | bibi@example.com | user |
| `idrovo` | idrovo@example.com | user |
| `byron` | byron@example.com | user |

### Client Users (end users, no admin access)

| Username | Email | Notes |
|---|---|---|
| `client_admin` | client_admin@example.com | Client with elevated permissions |
| `client_user` | client_user@example.com | Standard client user |
| `app_mobile` | app_mobile@example.com | Mobile app test user |

**Password for all test users:** `password123`

#### Logging In

1. Go to `http://localhost:3000/api/docs` (Scalar API reference)
2. Find the `POST /auth/login` endpoint
3. Enter credentials:
   ```json
   {
     "email": "charlie@example.com",
     "password": "password123"
   }
   ```
4. Copy the JWT token from the response
5. In Scalar, click the lock icon and paste the token to authorize subsequent requests

---

## API Documentation

Once the server is running, the interactive API reference (Scalar) is available at:

```
http://localhost:3000/api/docs
```

All endpoints use the global prefix `/api`.

---

## Troubleshooting

### MongoDB connection refused

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

- Confirm MongoDB is running: `mongosh --eval "db.runCommand({ ping: 1 })"`
- Check `MONGODB_URI` in `.env` — URI format must include the database name.
- If using Docker, see the [Docker guide](../deployment/docker.md).

### MinIO connection errors

Files upload will fail if MinIO is unreachable. For local development without file upload:

- Start MinIO via Docker: `docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"`
- Or set `MINIO_ENDPOINT` to a running instance.

### Port 3000 already in use

```bash
# macOS / Linux — find the process using port 3000
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

Change the port by setting `PORT=<other-port>` in `.env`.
