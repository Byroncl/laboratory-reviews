# Notifications Module Usage Examples

Practical guide for using the refactored notifications module patterns.

---

## 1. Import from the module barrel

Always import from the top-level barrel — never from deep paths:

```typescript
import {
  Notification,
  NotificationDto,
  NOTIFICATIONS_ENDPOINTS,
  NOTIFICATIONS_MESSAGES,
  NOTIFICATIONS_CONFIG,
  buildWebSocketUrl,
  mapNotificationDto,
  formatNotificationDate,
} from '@features/notifications';
```

> **Common mistake:** importing directly from `@features/notifications/utils/websocket.utils`
> breaks encapsulation and makes future refactors painful. Always use `@features/notifications`.

---

## 2. Use NotificationsService with signals

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Notification, NOTIFICATIONS_CONFIG } from '@features/notifications';

@Component({ selector: 'app-notification-bell', template: '' })
export class NotificationBellComponent {
  readonly notifications     = signal<Notification[]>([]);
  readonly unreadCount       = computed(() =>
    this.notifications().filter(n => !n.read).length
  );
  readonly hasUnread         = computed(() => this.unreadCount() > 0);
  readonly maxBadgeCount     = NOTIFICATIONS_CONFIG.MAX_BADGE_COUNT; // e.g. 99

  readonly displayCount = computed(() => {
    const count = this.unreadCount();
    return count > this.maxBadgeCount ? `${this.maxBadgeCount}+` : String(count);
  });

  addNotification(notification: Notification): void {
    this.notifications.update(list => [notification, ...list]);
  }

  markAsRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  removeNotification(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}
```

---

## 3. WebSocket integration

```typescript
import { Injectable, inject, OnDestroy } from '@angular/core';
import { buildWebSocketUrl, NOTIFICATIONS_CONFIG } from '@features/notifications';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;

  connect(userId: string, onMessage: (event: MessageEvent) => void): void {
    const url = buildWebSocketUrl(userId);
    this.socket = new WebSocket(url);

    this.socket.onopen    = () => { this.reconnectAttempts = 0; };
    this.socket.onmessage = onMessage;
    this.socket.onerror   = (err) => console.error('[WS] error', err);
    this.socket.onclose   = () => this.scheduleReconnect(userId, onMessage);
  }

  private scheduleReconnect(userId: string, onMessage: (event: MessageEvent) => void): void {
    const maxRetries = NOTIFICATIONS_CONFIG.MAX_RECONNECT_ATTEMPTS;
    if (this.reconnectAttempts >= maxRetries) return;

    const delay = NOTIFICATIONS_CONFIG.RECONNECT_DELAY_MS * (this.reconnectAttempts + 1);
    this.reconnectAttempts++;
    setTimeout(() => this.connect(userId, onMessage), delay);
  }

  send(payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }
}
```

---

## 4. Error handling

```typescript
import { Component, signal } from '@angular/core';
import { NOTIFICATIONS_MESSAGES } from '@features/notifications';

@Component({ selector: 'app-notifications-list', template: '' })
export class NotificationsListComponent {
  readonly isLoading = signal(false);
  readonly error     = signal<string | null>(null);

  private handleError(err: unknown): void {
    const messages = NOTIFICATIONS_MESSAGES;

    if (err instanceof Event && err.type === 'error') {
      this.error.set(messages.WEBSOCKET_ERROR);
    } else {
      this.error.set(messages.GENERIC_ERROR);
    }

    this.isLoading.set(false);
  }

  clearError(): void {
    this.error.set(null);
  }
}
```

> **Pattern:** always set `isLoading` back to `false` in both success and error paths.

---

## 5. Notifications component integration

A complete standalone component wiring together WebSocket, signals, and toast display:

```typescript
import {
  Component, inject, signal, computed, effect, OnDestroy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Notification,
  NotificationDto,
  mapNotificationDto,
  formatNotificationDate,
  NOTIFICATIONS_MESSAGES,
} from '@features/notifications';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  template: `
    @if (isConnected()) {
      <span class="badge">{{ displayCount() }}</span>
    }

    @for (notification of notifications(); track notification.id) {
      <div [class.unread]="!notification.read">
        <p>{{ notification.message }}</p>
        <small>{{ formatDate(notification.createdAt) }}</small>
        <button (click)="dismiss(notification.id)">
          {{ messages.DISMISS_BUTTON | translate }}
        </button>
      </div>
    } @empty {
      <p>{{ messages.EMPTY_STATE | translate }}</p>
    }
  `,
})
export class NotificationsPanelComponent implements OnDestroy {
  readonly messages     = NOTIFICATIONS_MESSAGES;
  readonly notifications = signal<Notification[]>([]);
  readonly isConnected   = signal(false);

  readonly unreadCount  = computed(() => this.notifications().filter(n => !n.read).length);
  readonly displayCount = computed(() => this.unreadCount() > 99 ? '99+' : String(this.unreadCount()));

  formatDate = formatNotificationDate;

  dismiss(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  onWebSocketMessage(dto: NotificationDto): void {
    const notification = mapNotificationDto(dto);
    this.notifications.update(list => [notification, ...list]);
  }

  ngOnDestroy(): void {
    this.isConnected.set(false);
  }
}
```

---

## 6. Real-time notification handling

Full real-time loop: connect WebSocket → receive messages → update signals → auto-scroll:

```typescript
import { Component, inject, signal, ElementRef, viewChild, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Notification,
  NotificationDto,
  mapNotificationDto,
  NOTIFICATIONS_CONFIG,
  NOTIFICATIONS_MESSAGES,
} from '@features/notifications';

@Component({
  selector: 'app-realtime-notifications',
  standalone: true,
  template: `
    <ul #listRef>
      @for (n of notifications(); track n.id) {
        <li [class.unread]="!n.read">{{ n.message }}</li>
      }
    </ul>
  `,
})
export class RealtimeNotificationsComponent {
  readonly notifications = signal<Notification[]>([]);
  readonly listRef = viewChild<ElementRef>('listRef');

  private socket: WebSocket | null = null;

  constructor() {
    // Auto-scroll whenever list changes
    effect(() => {
      const el = this.listRef()?.nativeElement as HTMLElement | undefined;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  connectWebSocket(userId: string): void {
    const url = `${NOTIFICATIONS_CONFIG.WEBSOCKET_BASE_URL}?userId=${userId}`;
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const dto: NotificationDto = JSON.parse(event.data as string);
        const notification = mapNotificationDto(dto);

        this.notifications.update(list => {
          const updated = [notification, ...list];
          // Keep only the most recent N notifications in memory
          return updated.slice(0, NOTIFICATIONS_CONFIG.MAX_IN_MEMORY);
        });
      } catch {
        console.error(NOTIFICATIONS_MESSAGES.PARSE_ERROR);
      }
    };
  }

  markAllAsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  clearAll(): void {
    this.notifications.set([]);
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }
}
```

---

## Best-practices checklist

- Import from the barrel `@features/notifications` — never from deep paths
- Type every notification with the `Notification` interface
- Use `NotificationDto` for incoming WebSocket/HTTP payloads; map with `mapNotificationDto`
- Manage notification list state with `signal<Notification[]>([])`
- Derive `unreadCount` and `hasUnread` with `computed()`
- Use `NOTIFICATIONS_MESSAGES` keys for all UI text — no hardcoded strings
- Use `NOTIFICATIONS_CONFIG` for connection settings and limits
- Always close the WebSocket in `ngOnDestroy`
- Apply exponential backoff for reconnection (see Example 3)
- Keep the in-memory list bounded (`MAX_IN_MEMORY`) to avoid memory leaks

---

## Next steps

1. Integrate `NotificationsPanelComponent` with a global toast/snackbar service
2. Persist read/unread state to the backend via a PATCH endpoint
3. Add push notification support (Web Push API) following the same signal pattern
4. Write unit tests for `mapNotificationDto`, `formatNotificationDate`, and `buildWebSocketUrl`
