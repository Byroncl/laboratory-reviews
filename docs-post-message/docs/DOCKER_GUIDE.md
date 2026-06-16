# Docker Guide

The repo ships with a `docker-compose.yml` at the root that brings up the **full stack** in a single command: database, object storage, API, frontend, and documentation site.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes the Docker daemon and Compose v2)
- Docker Compose v2 (`docker compose` — note: no hyphen)

---

## Root `.env` File

Before running any Compose command, create a `.env` file at the **repo root** (same directory as `docker-compose.yml`):

```bash
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=admin123
MONGO_DB_NAME=post-message

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=posts
```

This file is consumed by `docker-compose.yml` via `${VAR}` substitution. **Never commit it** — add `.env` to `.gitignore`.

---

## Services

| Service | Container | Port(s) | Description |
|---|---|---|---|
| `mongodb` | `laboratory_mongo` | 27019 (host) | MongoDB database with auth |
| `mongo-express` | `laboratory_mongo_express` | 8083 (host) | MongoDB web UI |
| `minio` | `laboratory_minio` | 9000, 9001 | Object storage (API + console) |
| `nestjs-app` | `laboratory_nestjs` | 3025 (host) → 3000 | NestJS REST API |
| `angular-app` | `laboratory_angular` | 3024 (host) → 4200 | Angular frontend app |
| `docs` | `laboratory_docs` | 3026 (host) → 3000 | Docusaurus documentation |

---

## Quick Start

```bash
# Start all services in the background
docker compose up -d
```

Wait ~30-45 seconds for services to pass their health checks. Then check status:

```bash
docker compose ps
```

All services should show `Up (healthy)` or `Up`.

### Build and Start (after code changes)

```bash
docker compose up -d --build
```

To rebuild only specific services:

```bash
docker compose build --no-cache nestjs-app
docker compose build --no-cache docs
docker compose up -d
```

---

## 🔗 Access URLs & Credentials

### 📚 Documentation (Docusaurus)
- **URL:** http://localhost:3026/docs
- **Credentials:** None (public)
- **Content:** Backend & frontend architecture, setup guides, API docs

### 🎨 Frontend (Angular)
- **URL:** http://localhost:3024
- **Credentials:** Use test credentials below
- **Features:** Posts, comments, user profiles, dashboard

### 🔧 Backend API (NestJS)

#### Scalar API Reference (Interactive Docs)
- **URL:** http://localhost:3025/api/docs
- **Credentials:** None to view, but most endpoints require JWT token
- **How to login:**
  1. Find `POST /auth/login` endpoint
  2. Click "Try it" and enter:
     ```json
     {
       "email": "charlie@example.com",
       "password": "password123"
     }
     ```
  3. Copy the `access_token` from the response
  4. Click the lock icon at top and paste the token
  5. All subsequent requests will include the Authorization header

#### Test User Credentials (see [Backend Setup](../backend/setup/index.md#test-credentials))
- **Admin:** charlie@example.com / password123 or bianca@example.com / password123
- **Client:** client_admin@example.com / password123 or client_user@example.com / password123

---

### 🗄️ MongoDB

#### Mongo Express (Web UI)
- **URL:** http://localhost:8083
- **Username:** admin
- **Password:** admin
- **Features:** Browse collections, run queries, manage indexes

#### Direct Connection (mongosh CLI)
```bash
mongosh --host localhost:27019 \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin
```

#### Connection String (for external tools)
```
mongodb://admin:admin123@localhost:27019/post-message?authSource=admin
```

---

### 📦 MinIO (Object Storage)

#### MinIO Console (Web UI)
- **URL:** http://localhost:9001
- **Username:** minioadmin
- **Password:** minioadmin
- **Features:** Upload files, manage buckets, browse objects, set access policies

#### MinIO API (for the backend)
- **Host:** http://minio:9000 (internal to Docker)
- **External:** http://localhost:9000
- **Credentials:** minioadmin / minioadmin
- **Bucket name:** posts

#### Useful Commands
```bash
# Check MinIO health from host
curl http://localhost:9000/minio/health/live

# List buckets using mc (MinIO client)
mc ls minio
```

---

## Useful Docker Commands

```bash
# Check the status of all services
docker compose ps

# Tail logs for a specific service
docker compose logs -f nestjs-app
docker compose logs -f mongodb
docker compose logs -f minio
docker compose logs -f docs

# View all logs with timestamps
docker compose logs --timestamps

# Stop all services (volumes are preserved)
docker compose down

# Stop all services AND delete all data volumes (⚠️ DESTROYS DATA)
docker compose down -v

# Restart a single service
docker compose restart nestjs-app

# Execute a command inside a running container
docker compose exec nestjs-app npm run test
docker compose exec mongodb mongosh --eval "db.users.countDocuments()"
```

---

## Health Checks

Each service declares a health check in `docker-compose.yml`:

| Service | Check | Interval | Retries | Start Period |
|---|---|---|---|---|
| `mongodb` | `mongosh` ping | 10s | 5 | — |
| `minio` | `curl` to `/minio/health/live` | 30s | 3 | — |
| `nestjs-app` | `node` HTTP GET to `/api/health` | 30s | 3 | 40s |
| `angular-app` | `wget` to http://localhost:4200 | 30s | 3 | 30s |

Services with `start_period` delay health checks to allow boot time before checking.

---

## Volumes

Two named volumes persist data across `docker compose down`:

| Volume | Mounted at | Data |
|---|---|---|
| `mongo_data` | `/data/db` (mongodb) | All MongoDB collections |
| `minio_data` | `/data` (minio) | All uploaded files |

Running `docker compose down -v` deletes both volumes. **This is irreversible** — use only for testing.

---

## Network

All services share the `app-network` bridge network:

- **MongoDB** is intentionally NOT port-mapped internally — only the host port 27019 is exposed. Containers communicate via internal DNS `mongodb:27017`.
- **NestJS** connects to MongoDB at `mongodb://admin:admin123@mongodb:27017/post-message?authSource=admin` (internal URL).
- **Angular** and **docs** can reach **NestJS** at `http://nestjs-app:3000` (internal), but from the host browser they reach it at `http://localhost:3025`.

---

## Rebuilding & Cleanup

### Rebuild Everything from Scratch
```bash
# Clean up old containers, images, and volumes
docker compose down -v

# Remove dangling images
docker image prune -f

# Rebuild and start fresh
docker compose up -d --build
```

### Rebuild Only the Backend
```bash
docker compose build --no-cache nestjs-app
docker compose up -d nestjs-app
```

### Rebuild Only the Documentation
```bash
docker compose build --no-cache docs
docker compose up -d docs
```

---

## Dockerfile Summaries

### Backend (`backend-post-message-nestjs/Dockerfile`)
- **Multi-stage build:** builder (node:22-alpine) → runtime (node:22-alpine)
- **Runtime user:** `nestjs` (UID 1001, non-root)
- **Entrypoint:** `dumb-init` wraps Node for proper signal handling
- **Port:** 3000 (inside container), mapped to 3025 on host

### Frontend (`frontend-post-message-angular/Dockerfile`)
- **Build:** Angular production build via `ng build`
- **Runtime:** Runs the built SSR server via Node
- **Port:** 4200 (inside container), mapped to 3024 on host

### Documentation (`docs-post-message/Dockerfile`)
- **Build:** Docusaurus build stage (node:22-alpine)
- **Runtime:** nginx:alpine serving static HTML
- **Port:** 3000 (inside container), mapped to 3026 on host
- **Config:** nginx config at `/etc/nginx/conf.d/app.conf`

---

## Troubleshooting

### Services keep restarting
Check logs for errors:
```bash
docker compose logs --tail 50 nestjs-app
```

### Cannot connect to MongoDB from Mongo Express
- Verify MongoDB is healthy: `docker compose ps mongodb`
- Check environment variables in docker-compose.yml match your `.env` file
- MongoDB credentials in Mongo Express must match MONGO_ROOT_USER and MONGO_ROOT_PASSWORD

### MinIO console shows "Insufficient Data"
- MinIO needs a writeable volume; ensure `minio_data` volume exists and has permissions
- Restart MinIO: `docker compose restart minio`

### Port already in use
Find and kill the process using the port:
```bash
# macOS / Linux
lsof -i :3025

# Windows
netstat -ano | findstr :3025
```

Or change the port mapping in `docker-compose.yml`.
