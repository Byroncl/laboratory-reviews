import { environment } from '../../../../../environments/environment';
export const NOTIFICATIONS_ENDPOINTS = {
  BASE: '/api/notifications',
  GET_ALL: '/api/notifications',
  GET_UNREAD: '/api/notifications/unread',
  GET_UNREAD_COUNT: '/api/notifications/unread-count',
  MARK_AS_READ: (id: string) => `/api/notifications/${id}/read`,
  MARK_ALL_AS_READ: '/api/notifications/read/all',
  DELETE: (id: string) => `/api/notifications/${id}`,
};

export const NOTIFICATIONS_WEBSOCKET = {
  URL: environment.socketUrl, // Should be from environment
  RECONNECTION: true,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_ATTEMPTS: 5,
  TRANSPORTS: ['websocket', 'polling'],
  EVENTS: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    USER_REGISTER: 'user:register',
    USER_REGISTERED: 'user:registered',
    NOTIFICATION_POST_CREATED: 'notification:post_created',
    NOTIFICATION_POST_FAVORITED: 'notification:post_favorited',
    NOTIFICATION_COMMENT_ADDED: 'notification:comment_added',
    POST_CREATED: 'post:created',
  },
};
