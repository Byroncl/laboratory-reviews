import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private maxRetries = 5;
  private retryCount = 0;

  private isConnected$ = new BehaviorSubject<boolean>(false);
  readonly isConnected = this.isConnected$.asObservable();

  private commentCreated$ = new BehaviorSubject<unknown>(null);
  readonly commentCreated = this.commentCreated$.asObservable();

  private replyCreated$ = new BehaviorSubject<unknown>(null);
  readonly replyCreated = this.replyCreated$.asObservable();

  private reactionAdded$ = new BehaviorSubject<unknown>(null);
  readonly reactionAdded = this.reactionAdded$.asObservable();

  private notificationReceived$ = new BehaviorSubject<Notification | null>(null);
  readonly notificationReceived = this.notificationReceived$.asObservable();

  connect(token: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const wsUrl = (environment.socketUrl ?? environment.apiUrl)
      .replace(/^http/, 'ws') + `?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected$.next(true);
        this.retryCount = 0;
        console.log('[WS] Connected');
      };

      this.ws.onclose = () => {
        this.isConnected$.next(false);
        console.log('[WS] Disconnected');
        this.scheduleReconnect(token);
      };

      this.ws.onerror = (err) => {
        console.error('[WS] Error', err);
        this.isConnected$.next(false);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as { event: string; data: unknown };
          this.dispatch(msg.event, msg.data);
        } catch {
          // non-JSON frame — ignore
        }
      };
    } catch (err) {
      console.error('[WS] Could not create WebSocket:', err);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.isConnected$.next(false);
  }

  emit(event: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private dispatch(event: string, data: unknown): void {
    switch (event) {
      case 'comment:created':
        this.commentCreated$.next(data);
        break;
      case 'reply:created':
        this.replyCreated$.next(data);
        break;
      case 'reaction:added':
        this.reactionAdded$.next(data);
        break;
      case 'notification:received':
        this.notificationReceived$.next((data as { notification: Notification }).notification);
        break;
    }
  }

  private scheduleReconnect(token: string): void {
    if (this.retryCount >= this.maxRetries) return;
    const delay = Math.min(1000 * 2 ** this.retryCount, 30000);
    this.retryCount++;
    this.reconnectTimer = setTimeout(() => this.connect(token), delay);
  }
}
