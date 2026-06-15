import { NotificationDto } from '../types';
import { NOTIFICATIONS_CONFIG } from '../constants';

export function getNotificationEmoji(type: string): string {
  return NOTIFICATIONS_CONFIG.EMOJI_MAP[type as keyof typeof NOTIFICATIONS_CONFIG.EMOJI_MAP] ||
         NOTIFICATIONS_CONFIG.EMOJI_MAP.default;
}

export function getNotificationColor(type: string): string {
  return NOTIFICATIONS_CONFIG.COLORS[type as keyof typeof NOTIFICATIONS_CONFIG.COLORS] ||
         NOTIFICATIONS_CONFIG.COLORS.default;
}

export function isNotificationUnread(notification: NotificationDto): boolean {
  return !notification.read;
}

export function getNotificationId(notification: NotificationDto): string {
  return notification._id || notification.id || '';
}

export function sortNotificationsByDate(notifications: NotificationDto[]): NotificationDto[] {
  return [...notifications].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function filterUnreadNotifications(notifications: NotificationDto[]): NotificationDto[] {
  return notifications.filter(isNotificationUnread);
}

export function countUnreadNotifications(notifications: NotificationDto[]): number {
  return filterUnreadNotifications(notifications).length;
}
