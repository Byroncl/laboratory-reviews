---
sidebar_position: 3
title: WebSocket Auth Issue
description: WsAuthGuard exists but is unused
---

# WebSocket Authentication Issue ⚠️

## Problem

The `WsAuthGuard` is defined but never applied to the WebSocket gateway.

**File**: `src/app/core/guards/ws-auth.guard.ts`

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

**But CommentsGateway doesn't use it**:

```typescript
@WebSocketGateway({
  namespace: '/comments',
})
// ❌ No @UseGuards(WsAuthGuard)
export class CommentsGateway {
  // Can create/update/delete comments without authentication
}
```

## Impact

- **No authentication on WebSocket mutations** — Any client can create/modify/delete comments
- **Anonymous user tracking** — In-memory user map can be spoofed
- **Security vulnerability** — No authorization checks on real-time events

## Solution

### 1. Apply Guard to Gateway

```typescript
@WebSocketGateway({
  namespace: '/comments',
  cors: { origin: '*' },
})
@UseGuards(WsAuthGuard)  // ✅ Add this
export class CommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // ...
}
```

### 2. Use Authenticated User

```typescript
@SubscribeMessage('comment:create')
async handleCreateComment(
  @MessageBody() data: CreateCommentDto,
  @ConnectedSocket() client: Socket,
) {
  // ✅ User is now available
  const user = client.handshake.user;
  
  if (!user) {
    throw new UnauthorizedException();
  }

  // Create comment with verified user
  const comment = await this.commentsService.createComment({
    ...data,
    userId: user.userId,
  });
  
  this.server.emit('comment:created', comment);
}
```

### 3. Update Client Connection

Clients must now send JWT token:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/comments', {
  auth: {
    token: 'Bearer eyJhbGc...',  // ✅ Include JWT
  },
});
```

## Implementation Steps

1. [ ] Add `@UseGuards(WsAuthGuard)` to `CommentsGateway`
2. [ ] Update all `@SubscribeMessage()` handlers to use `client.handshake.user`
3. [ ] Add authorization checks per event
4. [ ] Update client code to send JWT in handshake
5. [ ] Test WebSocket authentication
6. [ ] Document new client requirements

## Testing

```typescript
// Test with valid token
const socket = io('http://localhost:3000/comments', {
  auth: { token: 'Bearer ' + validToken },
});

socket.emit('comment:create', { ... });  // ✅ Should work

// Test with invalid token
const socket2 = io('http://localhost:3000/comments', {
  auth: { token: 'Bearer invalid' },
});

socket2.emit('comment:create', { ... });  // ❌ Should fail
```

## Related

- [WebSocket Security Guide](../websocket/security.md)
- [Guards Documentation](../core/guards.md)

---

**Severity**: 🔴 CRITICAL
**Impact**: WebSocket endpoint unprotected
**Timeline**: Immediate fix required

**Next**: [I18n Inconsistency →](./i18n-inconsistency.md)
