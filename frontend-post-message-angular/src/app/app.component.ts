import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, filter } from 'rxjs';
import * as AuthActions from './features/auth/store/auth.actions';
import { selectToken, selectIsAuthenticated } from './features/auth/store/auth.selectors';
import { AdvancedModalComponent } from './shared/components/modal/advanced-modal.component';
import { MinimizedModalsTrayComponent } from './shared/components/modal/minimized-modals-tray.component';
import { NotificationsToastComponent } from './shared/components/notifications-toast/notifications-toast.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { WebSocketService } from './core/services/websocket.service';
import { NotificationsService } from './core/services/notifications.service';
import { RealtimeNotifierService } from './core/services/realtime-notifier.service';
import { NotificationService } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdvancedModalComponent, MinimizedModalsTrayComponent, NotificationsToastComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend-post-message-angular';
  private subs = new Subscription();
  private notificationToastService = inject(NotificationService);

  constructor(
    private store: Store,
    private wsService: WebSocketService,
    private notificationsService: NotificationsService,
    private realtimeNotifier: RealtimeNotifierService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(AuthActions.loadAuthFromStorage());

    // Connect WebSocket when authenticated and token is available
    this.subs.add(
      this.store.select(selectToken).pipe(
        filter((token): token is string => !!token)
      ).subscribe(token => {
        this.wsService.connect(token);
      })
    );

    // Push real-time notifications into the notifications service
    this.subs.add(
      this.wsService.notificationReceived.pipe(
        filter(n => n !== null)
      ).subscribe(notification => {
        if (notification) {
          this.notificationsService.addNotification(notification as any);
          // Show toast for new notification
          this.notificationToastService.toast(
            `${notification.actorName} ${this.getNotificationAction(notification.type)}`,
            'success'
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.wsService.disconnect();
  }

  private getNotificationAction(type: string): string {
    const actions: Record<string, string> = {
      'comment_created': 'comentó en tu post',
      'reply_created': 'respondió tu comentario',
      'reaction_added': 'reaccionó a tu comentario',
      'post_created': 'creó un nuevo post',
      'post_favorited': 'marcó como favorito tu post',
    };
    return actions[type] || 'envió una notificación';
  }
}
