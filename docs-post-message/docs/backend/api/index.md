---
sidebar_position: 1
title: API Reference
description: REST endpoints and WebSocket events for the Post-Message backend.
---

# API Reference

## Base URL

```
http://localhost:3000/api
```

Interactive documentation (Scalar): `http://localhost:3000/api/docs`

---

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`. Public endpoints (`/auth/login`, `/auth/register`, `/health`) do not require a token.

---

## Response Envelopes

### Success

```json
{
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-06-15T12:00:00.000Z",
  "success": true
}
```

### Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be a valid email address"
  ],
  "timestamp": "2026-06-15T12:00:00.000Z",
  "path": "/api/users",
  "success": false
}
```

---

## REST Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | No | Authenticate and receive a JWT |
| POST | `/auth/register` | No | Register a new user account |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | Yes | List all users |
| GET | `/users/:id` | Yes | Get a user by ID |
| POST | `/users` | Yes | Create a user |
| PUT | `/users/:id` | Yes | Replace a user |
| DELETE | `/users/:id` | Yes | Delete a user |
| PATCH | `/users/:id/activate` | Yes | Activate a user account |
| PATCH | `/users/:id/deactivate` | Yes | Deactivate a user account |

### Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/posts` | Yes | List all posts |
| GET | `/posts/:id` | Yes | Get a post by ID |
| POST | `/posts` | Yes | Create a post |
| PUT | `/posts/:id` | Yes | Replace a post |
| DELETE | `/posts/:id` | Yes | Delete a post |
| GET | `/posts/:id/reactions` | Yes | Get reactions for a post |
| PATCH | `/posts/:id/status` | Yes | Update post publish status |

### Comments

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/comments` | Yes | List all comments |
| GET | `/comments/:id` | Yes | Get a comment by ID |
| POST | `/comments` | Yes | Create a comment |
| PUT | `/comments/:id` | Yes | Replace a comment |
| DELETE | `/comments/:id` | Yes | Delete a comment |

### Clients

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/clients` | Yes | List all clients |
| GET | `/clients/:id` | Yes | Get a client by ID |
| POST | `/clients` | Yes | Create a client |
| PUT | `/clients/:id` | Yes | Replace a client |
| DELETE | `/clients/:id` | Yes | Delete a client |

### Files

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/files/upload` | Yes | Upload a file to MinIO |
| GET | `/files` | Yes | List uploaded files |
| DELETE | `/files/:id` | Yes | Delete a file |

### Roles

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/roles` | Yes | List all roles |
| POST | `/roles` | Yes | Create a role |
| PUT | `/roles/:id` | Yes | Replace a role |
| DELETE | `/roles/:id` | Yes | Delete a role |

### Permissions

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/permissions` | Yes | List all permissions |
| POST | `/permissions` | Yes | Create a permission |
| PUT | `/permissions/:id` | Yes | Replace a permission |
| DELETE | `/permissions/:id` | Yes | Delete a permission |

### Internationalisation

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/i18n/:lang` | No | Get translation strings for a language |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Service health check |

---

## WebSocket API

The backend exposes real-time events via Socket.IO.

**Base URL:** `http://localhost:3000`

### Connecting with authentication

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/comments', {
  auth: {
    token: '<jwt-token>',
  },
});
```

Pass the JWT in the `auth.token` field of the Socket.IO connection options.

### Namespaces and Events

#### `/comments`

| Event | Direction | Description |
|---|---|---|
| `comment:created` | Server → Client | A new top-level comment was posted |
| `reply:created` | Server → Client | A reply was added to a comment |
| `reaction:added` | Server → Client | A reaction was added to a comment |
| `notification:received` | Server → Client | A notification was sent to the user |

#### `/users`

| Event | Direction | Description |
|---|---|---|
| `user:created` | Server → Client | A new user was registered |
| `user:updated` | Server → Client | A user's data was updated |
| `user:deleted` | Server → Client | A user was deleted |
| `user:activated` | Server → Client | A user account was activated |
| `user:deactivated` | Server → Client | A user account was deactivated |

#### `/posts`

| Event | Direction | Description |
|---|---|---|
| `post:created` | Server → Client | A new post was created |
| `post:updated` | Server → Client | A post was updated |
| `post:deleted` | Server → Client | A post was deleted |
| `post:published` | Server → Client | A post was published |

#### `/roles`

| Event | Direction | Description |
|---|---|---|
| `role:created` | Server → Client | A new role was created |
| `role:updated` | Server → Client | A role was updated |
| `role:deleted` | Server → Client | A role was deleted |

#### `/permissions`

| Event | Direction | Description |
|---|---|---|
| `permission:created` | Server → Client | A new permission was created |
| `permission:updated` | Server → Client | A permission was updated |
| `permission:deleted` | Server → Client | A permission was deleted |
