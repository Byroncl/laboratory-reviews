---
title: Core Services
sidebar_position: 1
description: Reference for all core Angular services, interceptors, directives, and pipes provided at application root.
---

# Core Services

All services in `core/services/` use `providedIn: 'root'` — they are application-wide singletons instantiated once and shared across every feature.

---

## ApiService

**File:** `core/services/api.service.ts`

A thin wrapper around Angular's `HttpClient` that prefixes every request with `environment.apiUrl`. All HTTP calls in the application go through this service, never through `HttpClient` directly.

```typescript
// Method signatures
get<T>(endpoint: string, params?: Record<string, string>): Observable<T>
post<T>(endpoint: string, body: unknown): Observable<T>
put<T>(endpoint: string, body: unknown): Observable<T>
delete<T>(endpoint: string): Observable<T>
```

Usage:

```typescript
this.apiService.get<Post[]>('/posts')
this.apiService.post<Post>('/posts', { title, body })
```

---

## WebSocketService

**File:** `core/services/websocket.service.ts`

Manages five simultaneous Socket.IO connections, one per namespace. Each namespace is opened on `connect(token)` and closed on `disconnect()`.

### Namespaces and Events

| Namespace | Events |
|---|---|
| `/comments` | `comment:created`, `reply:created`, `reaction:added`, `notification:received` |
| `/users` | `user:created`, `user:updated`, `user:deleted`, `user:activated`, `user:deactivated` |
| `/posts` | `post:created`, `post:updated`, `post:deleted`, `post:published` |
| `/roles` | `role:created`, `role:updated`, `role:deleted` |
| `/permissions` | `permission:created`, `permission:updated`, `permission:deleted` |

### Connection

```typescript
// Internally called for each namespace
io(`${environment.socketUrl}/${namespace}`, { auth: { token } })
```

### API

```typescript
connect(token: string): void          // Open all 5 namespace sockets
disconnect(): void                    // Close all sockets
emit(event: string, data: unknown, namespace: string): void
```

Each event type is backed by a `BehaviorSubject`. Components subscribe to these subjects to receive real-time updates reactively:

```typescript
// Example: subscribe to new comments
webSocketService.commentCreated$.subscribe(comment => { ... })
```

### Reconnection

The service applies exponential backoff on disconnect. Maximum 5 retries before giving up and emitting an error state.

---

## JwtInterceptor

**File:** `core/interceptors/jwt.interceptor.ts`

An `HttpInterceptor` that runs on every outgoing HTTP request.

**Primary behavior:**
- Reads `auth_token` from `localStorage` (SSR-safe: checks `typeof window !== 'undefined'` before accessing `localStorage`).
- Appends `Authorization: Bearer <token>` to the request headers if a token is present.

**Comment enrichment behavior:**
- For `POST`, `PUT`, and `DELETE` requests targeting `/api/comments`, the interceptor decodes the JWT and injects two additional fields into the request body: `userId` (from JWT `sub` claim) and `author` (from JWT display name claim).
- This avoids requiring the comment form to know about the authenticated user's identity separately.

---

## ErrorInterceptor

**File:** `core/interceptors/error.interceptor.ts`

Global HTTP error handler. Catches `HttpErrorResponse` events from all API calls, maps them to user-readable messages, and delegates to `ToastService` for display. Handles standard HTTP error codes (401, 403, 404, 500) with consistent messaging.

---

## I18nService

**File:** `core/services/i18n.service.ts`

Manages runtime translations. Loads a translation map for the active locale and exposes a `translate(key: string): string` method. The active locale can be switched at runtime; components using `TranslatePipe` update automatically.

---

## ToastService

**File:** `core/services/toast.service.ts`

Wraps SweetAlert2 to display non-blocking toast notifications. Provides convenience methods:

```typescript
success(message: string): void
error(message: string): void
warning(message: string): void
info(message: string): void
```

---

## FilesService

**File:** `core/services/files.service.ts`

Handles file upload and management operations. Used by the dashboard `/files` page. Wraps `ApiService` calls for multipart form data uploads and file listing/deletion.

---

## NotificationsService

**File:** `core/services/notifications.service.ts`

Manages in-app notifications (read state, mark-as-read). Works in conjunction with `RealtimeNotifierService`.

## RealtimeNotifierService

**File:** `core/services/realtime-notifier.service.ts`

Bridges the `notification:received` event from the `/comments` WebSocket namespace to `NotificationsService`. Listens for incoming notification payloads and pushes them into the notification store.

---

## PermissionsService

**File:** `core/services/permissions.service.ts`

Client-side RBAC evaluation. Loads the authenticated user's permissions on login and exposes synchronous checks:

```typescript
hasPermission(permission: string): boolean
hasRole(role: string): boolean
```

Used by `dashboardGuard`, `HasPermissionDirective`, and `HasRoleDirective`.

---

## Core Directives

### `HasPermissionDirective`

**File:** `core/directives/has-permission.directive.ts`
**Selector:** `*hasPermission`

Structural directive that conditionally renders its host element based on whether the current user holds the specified permission. Delegates to `PermissionsService`.

```html
<button *hasPermission="'posts:delete'">Delete</button>
```

### `HasRoleDirective`

**File:** `core/directives/has-role.directive.ts`
**Selector:** `*hasRole`

Same pattern as `HasPermissionDirective`, but checks against roles rather than individual permissions.

```html
<nav *hasRole="'admin'">Admin Menu</nav>
```

---

## Core Pipes

### `TranslatePipe`

**File:** `core/pipes/translate.pipe.ts`

Pure pipe that calls `I18nService.translate(key)`. Used in templates to avoid injecting `I18nService` directly into every component.

```html
{{ 'auth.login.submit' | translate }}
```
