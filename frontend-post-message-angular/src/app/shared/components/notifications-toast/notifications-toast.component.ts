import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../../core/services/notifications.service';
import { Notification } from '../../models/notification.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notifications-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-toast.component.html',
  styleUrl: './notifications-toast.component.scss',
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
  notifications: NotificationsService['notifications$'];

  constructor(private notificationsService: NotificationsService) {
    this.notifications = this.notificationsService.notifications$;
  }

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

  dismissNotification(notificationId: string | undefined): void {
    if (!notificationId) return;
    this.notificationsService.notifications$.update(list =>
      list.filter(n => (n._id || n.id) !== notificationId),
    );
  }
}
