import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Notification } from '../../shared/models/notification.model';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = signal<number>(0);

  private socket: Socket | null = null;

  constructor(private api: ApiService) {}

  private notifId(n: Notification): string {
    return (n._id ?? n.id) as string;
  }

  getNotifications(skip = 0, limit = 20): Observable<{ data: { items: Notification[]; unread: number }; message: string }> {
    return this.api
      .get<{ data: { items: Notification[]; unread: number }; message: string }>('/notifications', { skip, limit })
      .pipe(
        tap(response => {
          this.notifications.set(response.data?.items ?? []);
          this.unreadCount.set(response.data?.unread ?? 0);
        }),
        catchError(err => throwError(() => err))
      );
  }

  getUnreadCount(): Observable<{ data: { count: number }; message: string }> {
    return this.api
      .get<{ data: { count: number }; message: string }>('/notifications/unread-count')
      .pipe(
        tap(response => {
          this.unreadCount.set(response.data?.count ?? 0);
        })
      );
  }

  markAsRead(notificationId: string): Observable<{ message: string }> {
    return this.api.put<{ message: string }>(`/notifications/${notificationId}/read`, {}).pipe(
      tap(() => {
        const idx = this.notifications().findIndex(n => this.notifId(n) === notificationId);
        if (idx !== -1) {
          const updated = [...this.notifications()];
          updated[idx] = { ...updated[idx], read: true };
          this.notifications.set(updated);
          this.unreadCount.update(count => Math.max(0, count - 1));
        }
      })
    );
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.api.put<{ message: string }>('/notifications/read/all', {}).pipe(
      tap(() => {
        this.notifications.set(this.notifications().map(n => ({ ...n, read: true })));
        this.unreadCount.set(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/notifications/${notificationId}`).pipe(
      tap(() => {
        this.notifications.set(
          this.notifications().filter(n => this.notifId(n) !== notificationId)
        );
      })
    );
  }

  addNotification(notification: Notification): void {
    this.notifications.update(list => [notification, ...list]);
    if (!notification.read) {
      this.unreadCount.update(count => count + 1);
    }
  }

  connectWebSocket(userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to real-time notifications');
      this.socket?.emit('user:register', { userId });
    });

    this.socket.on('notification:post_created', (data: any) => {
      const notification: Notification = {
        _id: `post_${data.id}_${Date.now()}`,
        type: 'post',
        message: data.message,
        read: false,
      };
      this.addNotification(notification);
    });

    this.socket.on('notification:post_favorited', (data: any) => {
      const notification: Notification = {
        _id: `fav_${data.id}_${Date.now()}`,
        type: 'favorite',
        message: data.message,
        read: false,
      };
      this.addNotification(notification);
    });

    this.socket.on('notification:comment_added', (data: any) => {
      const notification: Notification = {
        _id: `comment_${data.id}_${Date.now()}`,
        type: 'comment',
        message: data.message,
        read: false,
      };
      this.addNotification(notification);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time notifications');
    });
  }

  disconnectWebSocket(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
