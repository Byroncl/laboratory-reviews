---
sidebar_position: 3
title: Problema de Autenticación WebSocket
description: WsAuthGuard existe pero no se usa
---

# Problema de Autenticación WebSocket ⚠️

## Problema

El `WsAuthGuard` está definido pero nunca se aplica al gateway WebSocket.

**Archivo**: `src/app/core/guards/ws-auth.guard.ts`

```typescript
@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const token = client.handshake.auth.token;

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.handshake.user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

**Pero CommentsGateway no lo usa**:

```typescript
@WebSocketGateway({
  namespace: '/comments',
})
// ❌ Sin @UseGuards(WsAuthGuard)
export class CommentsGateway {
  // Puede crear/actualizar/eliminar comentarios sin autenticación
}
```

## Impacto

- **Sin autenticación en mutaciones WebSocket** — Cualquier cliente puede crear/modificar/eliminar comentarios
- **Seguimiento anónimo de usuarios** — El mapa de usuarios en memoria puede ser suplantado
- **Vulnerabilidad de seguridad** — Sin comprobaciones de autorización en eventos en tiempo real

## Solución

### 1. Aplicar Guard al Gateway

```typescript
@WebSocketGateway({
  namespace: '/comments',
  cors: { origin: '*' },
})
@UseGuards(WsAuthGuard)  // ✅ Agregar esto
export class CommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // ...
}
```

### 2. Usar el Usuario Autenticado

```typescript
@SubscribeMessage('comment:create')
async handleCreateComment(
  @MessageBody() data: CreateCommentDto,
  @ConnectedSocket() client: Socket,
) {
  // ✅ El usuario ahora está disponible
  const user = client.handshake.user;
  
  if (!user) {
    throw new UnauthorizedException();
  }

  // Crear comentario con usuario verificado
  const comment = await this.commentsService.createComment({
    ...data,
    userId: user.userId,
  });
  
  this.server.emit('comment:created', comment);
}
```

### 3. Actualizar la Conexión del Cliente

Los clientes ahora deben enviar el token JWT:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/comments', {
  auth: {
    token: 'Bearer eyJhbGc...',  // ✅ Incluir JWT
  },
});
```

## Pasos de Implementación

1. [ ] Agregar `@UseGuards(WsAuthGuard)` a `CommentsGateway`
2. [ ] Actualizar todos los manejadores `@SubscribeMessage()` para usar `client.handshake.user`
3. [ ] Agregar comprobaciones de autorización por evento
4. [ ] Actualizar el código del cliente para enviar JWT en el handshake
5. [ ] Probar la autenticación WebSocket
6. [ ] Documentar los nuevos requisitos del cliente

## Pruebas

```typescript
// Probar con token válido
const socket = io('http://localhost:3000/comments', {
  auth: { token: 'Bearer ' + validToken },
});

socket.emit('comment:create', { ... });  // ✅ Debería funcionar

// Probar con token inválido
const socket2 = io('http://localhost:3000/comments', {
  auth: { token: 'Bearer invalid' },
});

socket2.emit('comment:create', { ... });  // ❌ Debería fallar
```

## Relacionado

- [Guía de Seguridad WebSocket](../websocket/security.md)
- [Documentación de Guards](../core/guards.md)

---

**Gravedad**: 🔴 CRÍTICO
**Impacto**: Endpoint WebSocket sin protección
**Plazo**: Corrección inmediata requerida

**Siguiente**: [Inconsistencia I18n →](./i18n-inconsistency.md)
