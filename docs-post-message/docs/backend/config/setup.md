---
sidebar_position: 2
title: Setup Guide
description: Getting started with the backend
---

# Setup Guide 🚀

## Prerequisites

- Node.js 18+
- MongoDB 4.4+
- MinIO (optional for local file storage)
- npm or yarn

## Installation

```bash
cd backend-post-message-nestjs

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

## Configuration

Edit `.env` with your settings:

```bash
HOST=localhost
PORT=3000
MONGODB_URI=mongodb://localhost:27017/post-message
MINIO_ENDPOINT=localhost:9000
```

## Running the Server

### Development Mode

```bash
npm run start:dev
```

Runs with hot-reload on http://localhost:3000

### Production Mode

```bash
npm run build
npm run start:prod
```

## Docker Setup

```bash
# Start MongoDB and MinIO
docker-compose up -d

# Run the backend
npm run start:dev
```

## Database Setup

MongoDB will auto-create collections on first write.

To seed initial data (roles, permissions):

```bash
npm run seed
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Troubleshooting

### MongoDB Connection Error
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB is running
- Verify authentication if needed

### MinIO Connection Error
- Check `MINIO_ENDPOINT` format
- Ensure MinIO container is running
- Verify credentials

### Port Already in Use
```bash
# Change PORT in .env or
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
```

---

**Next**: [WebSocket Security →](../websocket/security.md)
