export type NotificationType = 'comment_created' | 'reply_created' | 'reaction_added' | 'user_joined';

export interface NotificationTypeOption {
  value: NotificationType;
  label: string;
  emoji: string;
  color: string;
}

export const NOTIFICATION_TYPE_OPTIONS: Record<NotificationType, NotificationTypeOption> = {
  comment_created: {
    value: 'comment_created',
    label: 'notifications.types.comment_created',
    emoji: '📝',
    color: '#007bff',
  },
  reply_created: {
    value: 'reply_created',
    label: 'notifications.types.reply_created',
    emoji: '💬',
    color: '#51cf66',
  },
  reaction_added: {
    value: 'reaction_added',
    label: 'notifications.types.reaction_added',
    emoji: '❤️',
    color: '#ff6b6b',
  },
  user_joined: {
    value: 'user_joined',
    label: 'notifications.types.user_joined',
    emoji: 'ℹ️',
    color: '#868e96',
  },
};
