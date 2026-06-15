import { NOTIFICATIONS_WEBSOCKET } from '../constants';

export function createWebSocketConfig() {
  return {
    reconnection: NOTIFICATIONS_WEBSOCKET.RECONNECTION,
    reconnectionDelay: NOTIFICATIONS_WEBSOCKET.RECONNECTION_DELAY,
    reconnectionDelayMax: NOTIFICATIONS_WEBSOCKET.RECONNECTION_DELAY_MAX,
    reconnectionAttempts: NOTIFICATIONS_WEBSOCKET.RECONNECTION_ATTEMPTS,
    transports: NOTIFICATIONS_WEBSOCKET.TRANSPORTS,
  };
}

export function isWebSocketConnected(socket: any): boolean {
  return socket && socket.connected === true;
}

export function getEventName(type: string): string {
  const eventMap: Record<string, string> = {
    comment_created: NOTIFICATIONS_WEBSOCKET.EVENTS.NOTIFICATION_COMMENT_ADDED,
    reply_created: NOTIFICATIONS_WEBSOCKET.EVENTS.NOTIFICATION_COMMENT_ADDED,
    reaction_added: NOTIFICATIONS_WEBSOCKET.EVENTS.NOTIFICATION_POST_FAVORITED,
    user_joined: NOTIFICATIONS_WEBSOCKET.EVENTS.USER_REGISTERED,
  };
  return eventMap[type] || NOTIFICATIONS_WEBSOCKET.EVENTS.CONNECT;
}
