---
sidebar_position: 2
title: Seguridad WebSocket
description: Problemas de seguridad y mejoras
---

# Seguridad WebSocket ⚠️

## Problemas Actuales

### 1. Sin Autenticación en Mutaciones

El gateway no verifica tokens JWT en los eventos de creación/actualización/eliminación:

```typescript
@SubscribeMessage('comment:create')
async handleCreateComment(
  @MessageBody() data: CreateCommentDto,
  // ⚠️ Sin verificación de usuario
) {
  const comment = await this.commentsService.createComment(data);
  this.server.emit('comment:created', comment);
}
```

**Riesgo**: Cualquier cliente conectado puede crear/modificar/eliminar comentarios

### 2. WsAuthGuard Definido pero Sin Uso

El guard existe pero no se aplica:

```typescript
// En ws-auth.guard.ts
@Injectable()
export class WsAuthGuard implements CanActivate {
  // Verifica JWT del handshake
}

// Pero CommentsGateway no lo usa
```

### 3. Seguimiento de Usuarios en Memoria

La presencia del usuario se almacena en memoria y se pierde al reiniciar el servidor:

```typescript
private userConnections: Map<string, { userId: string; username: string }> = new Map();
// ⚠️ Sin persistencia, vulnerable a suplantación
```

## Correcciones Recomendadas

### 1. Habilitar WsAuthGuard

```typescript
@WebSocketGateway({
  namespace: '/comments',
  cors: { origin: '*' },
})
@UseGuards(WsAuthGuard)  // ✅ Agregar esto
export class CommentsGateway {
  // ...
}
```

### 2. Verificar Usuario en Eventos

```typescript
@SubscribeMessage('comment:create')
async handleCreateComment(
  @MessageBody() data: CreateCommentDto,
  @ConnectedSocket() client: Socket,
) {
  // ✅ Verificar usuario del JWT
  const user = client.handshake.user;
  if (!user) {
    throw new UnauthorizedException();
  }

  // Verificar que el usuario tiene permiso
  const hasPermission = user.role.permissions.some(
    p => p.identifier === 'comments:create'
  );
  if (!hasPermission) {
    throw new ForbiddenException();
  }

  // Crear con usuario verificado
  const comment = await this.commentsService.createComment({
    ...data,
    userId: user.userId,  // Usar usuario autenticado
  });
  
  this.server.emit('comment:created', comment);
}
```

### 3. Agregar Rate Limiting

```typescript
import { createClient } from 'redis';

@Injectable()
export class RateLimitService {
  private redis = createClient();

  async isAllowed(userId: string, action: string): Promise<boolean> {
    const key = `${userId}:${action}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 60);  // Resetear cada minuto
    }

    return count <= 10;  // Máximo 10 por minuto
  }
}
```

### 4. Sesiones de Usuario Persistentes

```typescript
// Usar Redis en lugar de Map
@Injectable()
export class UserSessionService {
  constructor(private redis: Redis) {}

  async registerUser(socketId: string, userId: string, username: string) {
    await this.redis.setex(
      `socket:${socketId}`,
      3600,  // Expiración de 1 hora
      JSON.stringify({ userId, username })
    );
  }

  async getUser(socketId: string) {
    const data = await this.redis.get(`socket:${socketId}`);
    return data ? JSON.parse(data) : null;
  }
}
```

## Lista de Verificación

- [ ] Aplicar `WsAuthGuard` a CommentsGateway
- [ ] Verificar JWT en todos los eventos de mutación
- [ ] Implementar rate limiting
- [ ] Usar Redis para sesiones de usuario
- [ ] Agregar comprobaciones de permisos para cada evento
- [ ] Registrar eventos de seguridad
- [ ] Agregar lista blanca de orígenes CORS

---

**Siguiente**: [Problemas Conocidos →](../issues/hardcoded-secrets.md)
