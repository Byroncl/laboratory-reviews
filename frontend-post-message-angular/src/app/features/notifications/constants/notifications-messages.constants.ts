export const NOTIFICATIONS_MESSAGES = {
  TOAST: {
    NOW: 'notifications.toast.now',
    CLOSE: 'notifications.toast.close',
  },
  TYPES: {
    COMMENT_CREATED: 'notifications.types.comment_created',
    REPLY_CREATED: 'notifications.types.reply_created',
    REACTION_ADDED: 'notifications.types.reaction_added',
    USER_JOINED: 'notifications.types.user_joined',
  },
  ACTIONS: {
    MARKED_READ: 'notifications.actions.marked_read',
    ALL_MARKED_READ: 'notifications.actions.all_marked_read',
    DELETED: 'notifications.actions.deleted',
  },
  ALERTS: {
    SUCCESS: 'notifications.alerts.success',
    ERROR: 'notifications.alerts.error',
    OK: 'notifications.alerts.ok',
    ACCEPT: 'notifications.alerts.accept',
    UNDERSTOOD: 'notifications.alerts.understood',
  },
};

export const NOTIFICATIONS_VALIDATION_MESSAGES = {
  USER_ID_REQUIRED: 'notifications.validation.user_id_required',
  TYPE_REQUIRED: 'notifications.validation.type_required',
  ACTOR_REQUIRED: 'notifications.validation.actor_required',
  POST_REQUIRED: 'notifications.validation.post_required',
  MESSAGE_REQUIRED: 'notifications.validation.message_required',
  MESSAGE_MAX_LENGTH: 'notifications.validation.message_max_length',
};
