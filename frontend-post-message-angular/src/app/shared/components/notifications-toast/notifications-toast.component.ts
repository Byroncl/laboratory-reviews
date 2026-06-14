import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../../core/services/notifications.service';
import { Notification } from '../../models/notification.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notifications-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div
        *ngFor="let notification of notifications()"
        class="toast notification-toast"
        [class]="'toast-' + notification.type"
        @slideIn
        (click)="dismissNotification(notification._id || notification.id)"
      >
        <div class="toast-icon">
          <span>{{ getIcon(notification.type) }}</span>
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ notification.message }}</p>
          <small class="toast-time">Ahora</small>
        </div>
        <button class="toast-close" (click)="dismissNotification(notification._id || notification.id)">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      }

      .notification-toast {
        margin-bottom: 12px;
      }

      .toast {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #007bff;
        animation: slideIn 0.3s ease-in-out;
      }

      .toast-post {
        border-left-color: #007bff;
      }

      .toast-favorite {
        border-left-color: #ff6b6b;
      }

      .toast-comment {
        border-left-color: #51cf66;
      }

      .toast-icon {
        font-size: 20px;
        min-width: 24px;
      }

      .toast-content {
        flex: 1;
      }

      .toast-message {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .toast-time {
        color: #999;
        font-size: 12px;
      }

      .toast-close {
        background: none;
        border: none;
        color: #ccc;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #999;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .notifications-container {
          left: 10px;
          right: 10px;
          max-width: none;
        }
      }
    `,
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-in-out', style({ transform: 'translateX(400px)', opacity: 0 }))]),
    ]),
  ],
})
export class NotificationsToastComponent implements OnInit {
  notifications = this.notificationsService.notifications;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {}

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      post: '📝',
      favorite: '❤️',
      comment: '💬',
      default: 'ℹ️',
    };
    return icons[type] || icons['default'];
  }

  dismissNotification(notificationId: string): void {
    this.notificationsService.notifications.update(list =>
      list.filter(n => (n._id || n.id) !== notificationId),
    );
  }
}
