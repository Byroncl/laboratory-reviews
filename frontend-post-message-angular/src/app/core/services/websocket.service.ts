import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../shared/models/notification.model';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private sockets: Map<string, Socket> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private maxRetries = 5;
  private retryCount = 0;

  private isConnected$ = new BehaviorSubject<boolean>(false);
  readonly isConnected = this.isConnected$.asObservable();

  // Comments
  private commentCreated$ = new BehaviorSubject<unknown>(null);
  readonly commentCreated = this.commentCreated$.asObservable();

  private replyCreated$ = new BehaviorSubject<unknown>(null);
  readonly replyCreated = this.replyCreated$.asObservable();

  private reactionAdded$ = new BehaviorSubject<unknown>(null);
  readonly reactionAdded = this.reactionAdded$.asObservable();

  // Users
  private userCreated$ = new BehaviorSubject<any>(null);
  readonly userCreated = this.userCreated$.asObservable();

  private userUpdated$ = new BehaviorSubject<any>(null);
  readonly userUpdated = this.userUpdated$.asObservable();

  private userDeleted$ = new BehaviorSubject<any>(null);
  readonly userDeleted = this.userDeleted$.asObservable();

  private userActivated$ = new BehaviorSubject<any>(null);
  readonly userActivated = this.userActivated$.asObservable();

  private userDeactivated$ = new BehaviorSubject<any>(null);
  readonly userDeactivated = this.userDeactivated$.asObservable();

  // Posts
  private postCreated$ = new BehaviorSubject<any>(null);
  readonly postCreated = this.postCreated$.asObservable();

  private postUpdated$ = new BehaviorSubject<any>(null);
  readonly postUpdated = this.postUpdated$.asObservable();

  private postDeleted$ = new BehaviorSubject<any>(null);
  readonly postDeleted = this.postDeleted$.asObservable();

  private postPublished$ = new BehaviorSubject<any>(null);
  readonly postPublished = this.postPublished$.asObservable();

  // Roles
  private roleCreated$ = new BehaviorSubject<any>(null);
  readonly roleCreated = this.roleCreated$.asObservable();

  private roleUpdated$ = new BehaviorSubject<any>(null);
  readonly roleUpdated = this.roleUpdated$.asObservable();

  private roleDeleted$ = new BehaviorSubject<any>(null);
  readonly roleDeleted = this.roleDeleted$.asObservable();

  // Permissions
  private permissionCreated$ = new BehaviorSubject<any>(null);
  readonly permissionCreated = this.permissionCreated$.asObservable();

  private permissionUpdated$ = new BehaviorSubject<any>(null);
  readonly permissionUpdated = this.permissionUpdated$.asObservable();

  private permissionDeleted$ = new BehaviorSubject<any>(null);
  readonly permissionDeleted = this.permissionDeleted$.asObservable();

  private notificationReceived$ = new BehaviorSubject<Notification | null>(null);
  readonly notificationReceived = this.notificationReceived$.asObservable();

  connect(token: string): void {
    const socketUrl = environment.socketUrl || window.location.origin;
    const namespaces = ['comments', 'users', 'posts', 'roles', 'permissions'];

    for (const namespace of namespaces) {
      if (this.sockets.has(namespace)) continue;

      try {
        const socket = io(`${socketUrl}/${namespace}`, {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxRetries,
        });

        socket.on('connect', () => {
          console.log(`[WS] Connected to ${namespace}`);
          this.isConnected$.next(true);
          this.retryCount = 0;
        });

        socket.on('disconnect', () => {
          console.log(`[WS] Disconnected from ${namespace}`);
          if (this.sockets.size === 0) {
            this.isConnected$.next(false);
          }
        });

        socket.on('error', (err) => {
          console.error(`[WS] Error on ${namespace}:`, err);
        });

        // Register user for real-time updates
        socket.emit('user:register', { userId: 'current', username: 'unknown' });

        // Setup listeners based on namespace
        this.setupNamespaceListeners(socket, namespace);

        this.sockets.set(namespace, socket);
      } catch (err) {
        console.error(`[WS] Could not connect to ${namespace}:`, err);
      }
    }
  }

  private setupNamespaceListeners(socket: Socket, namespace: string): void {
    if (namespace === 'comments') {
      socket.on('comment:created', (data) => this.commentCreated$.next(data));
      socket.on('reply:created', (data) => this.replyCreated$.next(data));
      socket.on('reaction:added', (data) => this.reactionAdded$.next(data));
      socket.on('notification:received', (data) => {
        this.notificationReceived$.next(
          (data as { notification: Notification }).notification || data
        );
      });
    } else if (namespace === 'users') {
      socket.on('user:created', (data) => this.userCreated$.next(data));
      socket.on('user:updated', (data) => this.userUpdated$.next(data));
      socket.on('user:deleted', (data) => this.userDeleted$.next(data));
      socket.on('user:activated', (data) => this.userActivated$.next(data));
      socket.on('user:deactivated', (data) => this.userDeactivated$.next(data));
    } else if (namespace === 'posts') {
      socket.on('post:created', (data) => this.postCreated$.next(data));
      socket.on('post:updated', (data) => this.postUpdated$.next(data));
      socket.on('post:deleted', (data) => this.postDeleted$.next(data));
      socket.on('post:published', (data) => this.postPublished$.next(data));
    } else if (namespace === 'roles') {
      socket.on('role:created', (data) => this.roleCreated$.next(data));
      socket.on('role:updated', (data) => this.roleUpdated$.next(data));
      socket.on('role:deleted', (data) => this.roleDeleted$.next(data));
    } else if (namespace === 'permissions') {
      socket.on('permission:created', (data) => this.permissionCreated$.next(data));
      socket.on('permission:updated', (data) => this.permissionUpdated$.next(data));
      socket.on('permission:deleted', (data) => this.permissionDeleted$.next(data));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    for (const socket of this.sockets.values()) {
      socket.close();
    }
    this.sockets.clear();
    this.isConnected$.next(false);
  }

  emit(event: string, data: unknown, namespace: string = 'comments'): void {
    const socket = this.sockets.get(namespace);
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private scheduleReconnect(token: string): void {
    if (this.retryCount >= this.maxRetries) return;
    const delay = Math.min(1000 * 2 ** this.retryCount, 30000);
    this.retryCount++;
    this.reconnectTimer = setTimeout(() => this.connect(token), delay);
  }
}
