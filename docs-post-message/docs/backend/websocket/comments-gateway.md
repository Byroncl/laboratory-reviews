---
sidebar_position: 1
title: Comments Gateway
description: Real-time WebSocket communication
---

# Comments Gateway ⚡

WebSocket gateway for real-time comment updates.

## Overview

```typescript
@WebSocketGateway({
  namespace: '/comments',
  cors: { origin: '*' },
})
export class CommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Handlers...
}
```

**Location**: `src/app/modules/comments/gateways/comments.gateway.ts`

## Events

### User Management

- **`user:register`** — Register user presence
  ```typescript
  socket.emit('user:register', { userId: '123', username: 'john' });
  // Server broadcasts: users:connected
  ```

### Comment Operations

- **`comment:create`** — Create new comment
- **`comment:update`** — Update comment
- **`comment:delete`** — Delete comment
- **`comments:list`** — Fetch all comments for post

### Typing Indicators

- **`comment:typing`** — User started typing
- **`comment:typing:stop`** — User stopped typing

## Client Implementation (Angular)

```typescript
import { io, Socket } from 'socket.io-client';

@Injectable()
export class CommentsSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000/comments');
  }

  registerUser(userId: string, username: string) {
    this.socket.emit('user:register', { userId, username });
  }

  createComment(comment: CreateCommentDto) {
    this.socket.emit('comment:create', comment);
  }

  onCommentCreated() {
    return new Observable(observer => {
      this.socket.on('comment:created', comment => {
        observer.next(comment);
      });
    });
  }

  onUsersConnected() {
    return new Observable(observer => {
      this.socket.on('users:connected', users => {
        observer.next(users);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
```

---

**Next**: [WebSocket Security →](./security.md)
