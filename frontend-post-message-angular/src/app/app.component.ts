import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, filter } from 'rxjs';
import * as AuthActions from './features/auth/store/auth.actions';
import { selectToken, selectIsAuthenticated } from './features/auth/store/auth.selectors';
import { AdvancedModalComponent } from './shared/components/modal/advanced-modal.component';
import { MinimizedModalsTrayComponent } from './shared/components/modal/minimized-modals-tray.component';
import { NotificationsToastComponent } from './shared/components/notifications-toast/notifications-toast.component';
import { WebSocketService } from './core/services/websocket.service';
import { NotificationsService } from './core/services/notifications.service';
import { RealtimeNotifierService } from './core/services/realtime-notifier.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdvancedModalComponent, MinimizedModalsTrayComponent, NotificationsToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend-post-message-angular';
  private subs = new Subscription();

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
        this.notificationsService.getNotifications().subscribe();
      })
    );

    // Push real-time notifications into the notifications service
    this.subs.add(
      this.wsService.notificationReceived.pipe(
        filter(n => n !== null)
      ).subscribe(notification => {
        if (notification) {
          this.notificationsService.addNotification(notification as any);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.wsService.disconnect();
  }
}
