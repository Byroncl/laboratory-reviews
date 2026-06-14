---
sidebar_position: 2
title: WebSocket Security
description: Security concerns and improvements
---

# WebSocket Security ⚠️

## Current Issues

### 1. No Authentication on Mutations

The gateway doesn't verify JWT tokens on create/update/delete events:

```typescript
@SubscribeMessage('comment:create')
async handleCreateComment(
  @MessageBody() data: CreateCommentDto,
  // ⚠️ No user verification
) {
  const comment = await this.commentsService.createComment(data);
  this.server.emit('comment:created', comment);
}
```

**Risk**: Any connected client can create/modify/delete comments

### 2. WsAuthGuard Defined but Unused

The guard exists but isn't applied:

```typescript
// In ws-auth.guard.ts
@Injectable()
export class WsAuthGuard implements CanActivate {
  // Verifies JWT from handshake
}

// But CommentsGateway doesn't use it
```

### 3. In-Memory User Tracking

User presence is stored in memory and lost on server restart:

```typescript
private userConnections: Map<string, { userId: string; username: string }> = new Map();
// ⚠️ No persistence, vulnerable to spoofing
```

## Recommended Fixes

### 1. Enable WsAuthGuard

```typescript
@WebSocketGateway({
  namespace: '/comments',
  cors: { origin: '*' },
})
@UseGuards(WsAuthGuard)  // ✅ Add this
export class CommentsGateway {
  // ...
}
```

### 2. Verify User on Events

```typescript
@SubscribeMessage('comment:create')
async handleCreateComment(
  @MessageBody() data: CreateCommentDto,
  @ConnectedSocket() client: Socket,
) {
  // ✅ Verify user from JWT
  const user = client.handshake.user;
  if (!user) {
    throw new UnauthorizedException();
  }

  // Verify user has permission
  const hasPermission = user.role.permissions.some(
    p => p.identifier === 'comments:create'
  );
  if (!hasPermission) {
    throw new ForbiddenException();
  }

  // Create with verified user
  const comment = await this.commentsService.createComment({
    ...data,
    userId: user.userId,  // Use authenticated user
  });
  
  this.server.emit('comment:created', comment);
}
```

### 3. Add Rate Limiting

```typescript
import { createClient } from 'redis';

@Injectable()
export class RateLimitService {
  private redis = createClient();

  async isAllowed(userId: string, action: string): Promise<boolean> {
    const key = `${userId}:${action}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 60);  // Reset every minute
    }

    return count <= 10;  // Max 10 per minute
  }
}
```

### 4. Persistent User Sessions

```typescript
// Use Redis instead of Map
@Injectable()
export class UserSessionService {
  constructor(private redis: Redis) {}

  async registerUser(socketId: string, userId: string, username: string) {
    await this.redis.setex(
      `socket:${socketId}`,
      3600,  // 1 hour expiry
      JSON.stringify({ userId, username })
    );
  }

  async getUser(socketId: string) {
    const data = await this.redis.get(`socket:${socketId}`);
    return data ? JSON.parse(data) : null;
  }
}
```

## Checklist

- [ ] Apply `WsAuthGuard` to CommentsGateway
- [ ] Verify JWT on all mutation events
- [ ] Implement rate limiting
- [ ] Use Redis for user sessions
- [ ] Add permission checks for each event
- [ ] Log security events
- [ ] Add CORS origin whitelist

---

**Next**: [Known Issues →](../issues/hardcoded-secrets.md)
