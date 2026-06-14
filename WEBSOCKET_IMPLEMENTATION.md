# WebSocket Real-Time Updates Implementation

## Overview
Implemented Socket.IO-based real-time updates for users, posts, roles, and permissions. When any of these entities are created, updated, or deleted, all connected clients receive instant notifications via WebSocket.

## Backend Implementation

### 1. Created WebSocket Gateways

#### Users Gateway
**File**: `backend-post-message-nestjs/src/app/modules/users/gateways/users.gateway.ts`
- Namespace: `/users`
- Events:
  - `user:created` - broadcasts when a user is created
  - `user:updated` - broadcasts when a user is updated
  - `user:deleted` - broadcasts when a user is deleted
  - `user:activated` - broadcasts when a user is activated
  - `user:deactivated` - broadcasts when a user is deactivated

#### Posts Gateway
**File**: `backend-post-message-nestjs/src/app/modules/posts/gateways/posts.gateway.ts`
- Namespace: `/posts`
- Events:
  - `post:created` - broadcasts when a post is created
  - `post:updated` - broadcasts when a post is updated
  - `post:deleted` - broadcasts when a post is deleted
  - `post:published` - broadcasts when a post is published

#### Roles Gateway
**File**: `backend-post-message-nestjs/src/app/modules/roles/gateways/roles.gateway.ts`
- Namespace: `/roles`
- Events:
  - `role:created` - broadcasts when a role is created
  - `role:updated` - broadcasts when a role is updated
  - `role:deleted` - broadcasts when a role is deleted

#### Permissions Gateway
**File**: `backend-post-message-nestjs/src/app/modules/permissions/gateways/permissions.gateway.ts`
- Namespace: `/permissions`
- Events:
  - `permission:created` - broadcasts when a permission is created
  - `permission:updated` - broadcasts when a permission is updated
  - `permission:deleted` - broadcasts when a permission is deleted

### 2. Updated Controllers

Each controller now injects its corresponding gateway and calls notification methods when operations complete:

#### Users Controller Updates
- `create()` → calls `usersGateway.notifyUserCreated()`
- `update()` → calls `usersGateway.notifyUserUpdated()`
- `remove()` → calls `usersGateway.notifyUserDeleted()`
- `activate()` → calls `usersGateway.notifyUserActivated()`
- `deactivate()` → calls `usersGateway.notifyUserDeactivated()`

#### Posts Controller Updates
- `create()` → calls `postsGateway.notifyPostCreated()`
- `update()` → calls `postsGateway.notifyPostUpdated()`
- `remove()` → calls `postsGateway.notifyPostDeleted()`

#### Roles Controller Updates
- `create()` → calls `rolesGateway.notifyRoleCreated()`
- `update()` → calls `rolesGateway.notifyRoleUpdated()`
- `remove()` → calls `rolesGateway.notifyRoleDeleted()`

#### Permissions Controller Updates
- `create()` → calls `permissionsGateway.notifyPermissionCreated()`
- `update()` → calls `permissionsGateway.notifyPermissionUpdated()`
- `remove()` → calls `permissionsGateway.notifyPermissionDeleted()`

### 3. Module Registration

Each module now exports its gateway as a provider:
- `users.module.ts` - provides `UsersGateway`
- `posts.module.ts` - provides `PostsGateway`
- `roles.module.ts` - provides `RolesGateway`
- `permissions.module.ts` - provides `PermissionsGateway`

## Frontend Implementation

### 1. Enhanced WebSocket Service
**File**: `frontend-post-message-angular/src/app/core/services/websocket.service.ts`

**Key Changes**:
- Migrated from native WebSocket to Socket.IO client (`socket.io-client`)
- Multi-namespace support: connects to `/comments`, `/users`, `/posts`, `/roles`, `/permissions` namespaces
- New observables for all real-time events:
  - User events: `userCreated$`, `userUpdated$`, `userDeleted$`, `userActivated$`, `userDeactivated$`
  - Post events: `postCreated$`, `postUpdated$`, `postDeleted$`, `postPublished$`
  - Role events: `roleCreated$`, `roleUpdated$`, `roleDeleted$`
  - Permission events: `permissionCreated$`, `permissionUpdated$`, `permissionDeleted$`

**Methods**:
- `connect(token)` - connects to all namespaces using JWT token
- `disconnect()` - closes all Socket.IO connections
- `emit(event, data, namespace)` - sends messages to a specific namespace
- `setupNamespaceListeners(socket, namespace)` - sets up listeners based on namespace

### 2. Real-Time Notifier Service
**File**: `frontend-post-message-angular/src/app/core/services/realtime-notifier.service.ts`

**Purpose**: Listens to WebSocket events and displays SweetAlert2 toast notifications

**Features**:
- Auto-subscribes to all WebSocket events
- Shows contextual toast notifications for each event
- Toast properties:
  - Position: `top-end` (top-right corner)
  - Duration: 3 seconds (auto-dismiss)
  - Timer: progressBar shows countdown
  - Interactive: hover to pause timer
  - Icons: success (green), info (blue), warning (orange)

**Event Examples**:
- User created: "User created by [admin]" (green toast)
- User updated: "[User] updated by [admin]" (blue toast)
- User deleted: "User deleted by [admin]" (orange toast)
- Similar patterns for posts, roles, permissions

### 3. Updated App Component
**File**: `frontend-post-message-angular/src/app/app.component.ts`

**Changes**:
- Injected `RealtimeNotifierService` to activate real-time listeners
- Service initializes automatically when AppComponent loads
- Listeners remain active throughout the application lifetime

## Data Flow

```
Backend User Action
  ↓
Controller calls service
  ↓
Service executes action (create/update/delete)
  ↓
Controller calls gateway.notifyXxx()
  ↓
Gateway broadcasts via Socket.IO
  ↓
Connected clients receive event
  ↓
WebSocket Service receives event → BehaviorSubject.next()
  ↓
RealtimeNotifier subscribes to BehaviorSubject
  ↓
Shows SweetAlert2 toast notification
  ↓
User sees "Admin updated this user" in top-right corner
```

## Event Payload Structure

### User Events
```typescript
{
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdBy/updatedBy/deletedBy/activatedBy/deactivatedBy: string;
  createdAt/updatedAt: ISO8601 timestamp;
  message: i18n translated message;
}
```

### Post Events
```typescript
{
  id: string;
  title: string;
  content: string;
  status: string;
  createdBy/updatedBy/deletedBy/publishedBy: string;
  createdAt/updatedAt/publishedAt: ISO8601 timestamp;
  message: i18n translated message;
}
```

### Role/Permission Events
```typescript
{
  id: string;
  name: string;
  description: string;
  createdBy/updatedBy/deletedBy: string;
  createdAt/updatedAt: ISO8601 timestamp;
  message: i18n translated message;
}
```

## Testing the Implementation

### 1. Start Backend
```bash
cd backend-post-message-nestjs
npm run dev
```

### 2. Start Frontend
```bash
cd frontend-post-message-angular
npm start
```

### 3. Test Scenarios

**Scenario A - Single Browser**:
1. Login to admin account
2. Open browser dev console to see WebSocket connections
3. Go to Users management
4. Open Users management in another tab (same browser)
5. Create/update/delete a user in one tab
6. See real-time toast notification in the other tab

**Scenario B - Multiple Users**:
1. Open frontend in two different browsers (or incognito windows)
2. Login with different admin accounts
3. Create/update/delete a user in first browser
4. See real-time notification in second browser (no refresh needed)

### 4. Console Logs to Verify Connections
```
[WS] Connected to comments
[WS] Connected to users
[WS] Connected to posts
[WS] Connected to roles
[WS] Connected to permissions
```

## Translation Keys

The implementation uses i18n for event messages:
- `users.created` - "User created"
- `users.updated` - "User updated"
- `users.deleted` - "User deleted"
- `users.activated` - "User activated"
- `users.deactivated` - "User deactivated"
- `posts.created` - "Post created"
- `posts.updated` - "Post updated"
- `posts.deleted` - "Post deleted"
- `posts.published` - "Post published"
- `roles.created` - "Role created"
- `roles.updated` - "Role updated"
- `roles.deleted` - "Role deleted"
- `permissions.created` - "Permission created"
- `permissions.updated` - "Permission updated"
- `permissions.deleted` - "Permission deleted"

## Architecture Decisions

### Why Socket.IO over WebSocket?
- **Automatic Reconnection**: Handles disconnections gracefully
- **Fallback Support**: Can use polling if WebSocket fails
- **Message Queuing**: Manages missed messages during disconnections
- **Namespace Support**: Cleanly organizes events by domain
- **Built-in Auth**: JWT token passed via query params

### Why Multiple Namespaces?
- **Scalability**: Each domain has isolated connection pool
- **Flexibility**: Clients can subscribe to specific namespaces
- **Organization**: Clear separation of concerns
- **Future**: Easy to add broadcasting rules per namespace

### Why BehaviorSubject?
- **Multi-Subscriber**: Multiple components can listen to same event
- **Latest Value**: Late subscribers get the last emitted event
- **Reactive**: RxJS integration with rest of Angular app
- **Performance**: No additional lookups needed

## Known Limitations

1. **Token Expiration**: WebSocket connection not auto-refreshed if JWT expires during session
2. **Browser Tabs**: Each browser tab has separate WebSocket connections (expected behavior)
3. **Offline Mode**: No queue for events sent while offline
4. **Max Retries**: After 5 reconnection attempts, gives up (configurable)

## Future Enhancements

1. Token refresh mechanism for long-lived connections
2. Local storage of events during offline periods
3. Selective subscription (only watch specific user updates)
4. WebSocket-to-REST fallback with polling
5. Presence tracking (who's online now)
6. Typed event system with stronger type safety

## Files Modified/Created

### Backend
- ✅ Created: `src/app/modules/users/gateways/users.gateway.ts`
- ✅ Created: `src/app/modules/posts/gateways/posts.gateway.ts`
- ✅ Created: `src/app/modules/roles/gateways/roles.gateway.ts`
- ✅ Created: `src/app/modules/permissions/gateways/permissions.gateway.ts`
- ✅ Updated: `src/app/modules/users/users.module.ts`
- ✅ Updated: `src/app/modules/users/controllers/users.controller.ts`
- ✅ Updated: `src/app/modules/posts/posts.module.ts`
- ✅ Updated: `src/app/modules/posts/controllers/posts.controller.ts`
- ✅ Updated: `src/app/modules/roles/roles.module.ts`
- ✅ Updated: `src/app/modules/roles/controllers/roles.controller.ts`
- ✅ Updated: `src/app/modules/permissions/permissions.module.ts`
- ✅ Updated: `src/app/modules/permissions/controllers/permissions.controller.ts`

### Frontend
- ✅ Created: `src/app/core/services/realtime-notifier.service.ts`
- ✅ Updated: `src/app/core/services/websocket.service.ts`
- ✅ Updated: `src/app/app.component.ts`

## Verification Checklist

- [x] Gateways created for all 4 domains (users, posts, roles, permissions)
- [x] Controllers emit WebSocket events on create/update/delete
- [x] Frontend WebSocket service uses socket.io-client
- [x] Multi-namespace support implemented
- [x] Real-time toast notifications working
- [x] Toast shows actor name (who performed the action)
- [x] Toast shows entity details (username, post title, etc.)
- [x] App initializes notifier service automatically
- [x] TypeScript types properly defined
- [x] Error handling in place
- [x] Console logging for debugging
