import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { NOTIFICATIONS_ENDPOINTS, NOTIFICATIONS_WEBSOCKET } from '../../features/notifications/constants';
import { NotificationDto, NotificationsResponse, PaginatedNotificationsResponse, NotificationApiResponse } from '../../features/notifications/types';
import { createWebSocketConfig, isWebSocketConnected, getNotificationEmoji, sortNotificationsByDate, countUnreadNotifications } from '../../features/notifications/utils';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly http = inject(HttpClient);

  private socket: Socket | null = null;
  private userId: string | null = null;

  // State signals
  readonly notifications$ = signal<NotificationDto[]>([]);
  readonly isLoading$ = signal(false);
  readonly error$ = signal<string | null>(null);
  readonly isSocketConnected$ = signal(false);

  // Computed properties
  readonly unreadCount = computed(() => countUnreadNotifications(this.notifications$()));
  readonly unreadNotifications = computed(() => this.notifications$().filter(n => !n.read));
  readonly sortedNotifications = computed(() => sortNotificationsByDate(this.notifications$()));

  constructor() {
    effect(() => {
      if (this.isSocketConnected$()) {
      }
    });
  }

  getNotifications(page: number = 1, limit: number = 10) {
    this.isLoading$.set(true);
    this.error$.set(null);

    return this.http
      .get<PaginatedNotificationsResponse>(NOTIFICATIONS_ENDPOINTS.GET_ALL, {
        params: { page, limit },
      })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching notifications:', error);
          this.error$.set('Error loading notifications');
          return throwError(() => error);
        })
      );
  }

  getUnreadCount() {
    return this.http
      .get<NotificationApiResponse<{ count: number }>>(NOTIFICATIONS_ENDPOINTS.GET_UNREAD_COUNT)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching unread count:', error);
          return throwError(() => error);
        })
      );
  }

  markAsRead(notificationId: string) {
    return this.http
      .put<NotificationApiResponse<NotificationDto>>(
        NOTIFICATIONS_ENDPOINTS.MARK_AS_READ(notificationId),
        {}
      )
      .pipe(
        catchError(error => {
          console.error('Error marking notification as read:', error);
          return throwError(() => error);
        })
      );
  }

  markAllAsRead() {
    return this.http
      .put<NotificationApiResponse<{ count: number }>>(
        NOTIFICATIONS_ENDPOINTS.MARK_ALL_AS_READ,
        {}
      )
      .pipe(
        catchError(error => {
          console.error('Error marking all notifications as read:', error);
          return throwError(() => error);
        })
      );
  }

  deleteNotification(notificationId: string) {
    return this.http
      .delete<NotificationApiResponse<void>>(NOTIFICATIONS_ENDPOINTS.DELETE(notificationId))
      .pipe(
        catchError(error => {
          console.error('Error deleting notification:', error);
          return throwError(() => error);
        })
      );
  }

  // Signal-based notification management
  addNotification(notification: NotificationDto): void {
    this.notifications$.update(current => [notification, ...current]);
  }

  removeNotification(notificationId: string): void {
    this.notifications$.update(current =>
      current.filter(n => (n._id || n.id) !== notificationId)
    );
  }

  updateNotification(notificationId: string, updates: Partial<NotificationDto>): void {
    this.notifications$.update(current =>
      current.map(n => {
        if ((n._id || n.id) === notificationId) {
          return { ...n, ...updates };
        }
        return n;
      })
    );
  }

  clearAll(): void {
    this.notifications$.set([]);
  }

  // WebSocket management
  connectWebSocket(userId: string): void {
    if (this.socket && isWebSocketConnected(this.socket)) {
      return;
    }

    this.userId = userId;
    const config = createWebSocketConfig();

    this.socket = io(NOTIFICATIONS_WEBSOCKET.URL, config);

    this.socket.on(NOTIFICATIONS_WEBSOCKET.EVENTS.CONNECT, () => {
      this.isSocketConnected$.set(true);
      this.socket?.emit(NOTIFICATIONS_WEBSOCKET.EVENTS.USER_REGISTER, { userId });
    });

    this.socket.on(NOTIFICATIONS_WEBSOCKET.EVENTS.DISCONNECT, () => {
      this.isSocketConnected$.set(false);
    });

    this.socket.on(NOTIFICATIONS_WEBSOCKET.EVENTS.NOTIFICATION_POST_CREATED, (data: any) => {
      this.addNotification({
        _id: data.id,
        userId,
        type: 'comment_created',
        actorId: data.actorId,
        actorName: data.actorName,
        postId: data.postId,
        message: data.message,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    this.socket.on(NOTIFICATIONS_WEBSOCKET.EVENTS.NOTIFICATION_POST_FAVORITED, (data: any) => {
      this.addNotification({
        _id: data.id,
        userId,
        type: 'reaction_added',
        actorId: data.actorId,
        actorName: data.actorName,
        postId: data.postId,
        emoji: '❤️',
        message: data.message,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    this.socket.on(NOTIFICATIONS_WEBSOCKET.EVENTS.NOTIFICATION_COMMENT_ADDED, (data: any) => {
      this.addNotification({
        _id: data.id,
        userId,
        type: 'comment_created',
        actorId: data.actorId,
        actorName: data.actorName,
        postId: data.postId,
        commentId: data.commentId,
        message: data.message,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isSocketConnected$.set(false);
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return isWebSocketConnected(this.socket);
  }
}
