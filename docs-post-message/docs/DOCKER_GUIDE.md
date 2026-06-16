# Docker Guide

The repo ships with a `docker-compose.yml` at the root that brings up the full stack in a single command: database, object storage, API, and documentation site.

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

This file is consumed by `docker-compose.yml` via `${VAR}` substitution. Never commit it.

---

## Services

| Service | Container | Port(s) | Description |
|---|---|---|---|
| `mongodb` | `mi_mongo` | internal only | MongoDB database — not exposed to the host |
| `minio` | `mi_minio` | 9000 (API), 9001 (console) | MinIO object storage |
| `nestjs-app` | `mi_nestjs` | 3000 | NestJS REST API |
| `docs` | `mi_docs` | 3001 | Docusaurus documentation site |

---

## Quick Start

```bash
# Start all services in the background
docker compose up -d
```

Wait ~30 seconds for services to pass their health checks, then access the URLs below.

### Build and Start (after code changes)

```bash
docker compose up -d --build
```

---

## Useful Commands

```bash
# Check the status of all services
docker compose ps

# Tail logs for the NestJS app
docker compose logs -f nestjs-app

# Tail logs for MongoDB
docker compose logs -f mongodb

# Tail logs for MinIO
docker compose logs -f minio

# Stop all services (volumes are preserved)
docker compose down

# Stop all services AND delete all data volumes (DESTROYS DATA)
docker compose down -v
```

---

## URLs After Startup

| Service | URL |
|---|---|
| NestJS API | http://localhost:3000/api |
| Swagger / API docs | http://localhost:3000/api/docs |
| MinIO console | http://localhost:9001 |
| Documentation site | http://localhost:3001 |

---

## Health Checks

Each service declares a health check in `docker-compose.yml`:

| Service | Check | Interval | Retries |
|---|---|---|---|
| `mongodb` | `mongosh` ping | 10s | 5 |
| `minio` | `curl` to `/minio/health/live` | 30s | 3 |
| `nestjs-app` | `node` HTTP GET to `/api/health` (expects 200) | 30s | 3 |

`nestjs-app` has a `start_period: 40s` to allow the Node process to boot before checks begin.

---

## Volumes

Two named volumes persist data across `docker compose down`:

| Volume | Mounted at | Data |
|---|---|---|
| `mongo_data` | `/data/db` (mongodb) | All MongoDB collections |
| `minio_data` | `/data` (minio) | All uploaded files |

Running `docker compose down -v` deletes both volumes. This is irreversible.

---

## Network

All services share the `app-network` bridge network. MongoDB is intentionally not port-mapped to the host — it is only reachable from within Docker containers on this network. The NestJS app connects to it at `mongodb://...@mongodb:27017/...` using the internal DNS name `mongodb`.

---

## Backend Dockerfile Summary

The backend uses a two-stage build at `backend-post-message-nestjs/Dockerfile`:

1. **Build stage** — `node:22-alpine`: installs dependencies and compiles TypeScript.
2. **Runtime stage** — `node:22-alpine` with `dumb-init`: copies the compiled output, runs as non-root user `nestjs` (UID 1001) for reduced attack surface.

To rebuild only the backend image:

```bash
docker compose build nestjs-app
docker compose up -d nestjs-app
```
