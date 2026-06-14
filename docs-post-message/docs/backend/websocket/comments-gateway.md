---
sidebar_position: 1
title: Gateway de Comentarios
description: Comunicación WebSocket en tiempo real
---

# Gateway de Comentarios ⚡

Gateway WebSocket para actualizaciones de comentarios en tiempo real.

## Descripción General

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

  // Manejadores...
}
```

**Ubicación**: `src/app/modules/comments/gateways/comments.gateway.ts`

## Eventos

### Gestión de Usuarios

- **`user:register`** — Registrar presencia del usuario
  ```typescript
  socket.emit('user:register', { userId: '123', username: 'john' });
  // El servidor emite: users:connected
  ```

### Operaciones con Comentarios

- **`comment:create`** — Crear nuevo comentario
- **`comment:update`** — Actualizar comentario
- **`comment:delete`** — Eliminar comentario
- **`comments:list`** — Obtener todos los comentarios de un post

### Indicadores de Escritura

- **`comment:typing`** — Usuario comenzó a escribir
- **`comment:typing:stop`** — Usuario dejó de escribir

## Implementación en Cliente (Angular)

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

**Siguiente**: [Seguridad WebSocket →](./security.md)
