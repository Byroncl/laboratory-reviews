/**
 * Notifications module configuration constants
 */
export const NOTIFICATIONS_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MESSAGE_MAX_LENGTH: 500,
} as const;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  COMMENT_CREATED: 'comment_created',
  REPLY_CREATED: 'reply_created',
  REACTION_ADDED: 'reaction_added',
  USER_JOINED: 'user_joined',
} as const;

/**
 * Notifications module i18n message keys
 */
export const NOTIFICATIONS_MESSAGES = {
  // Success messages
  MARKED_READ: 'notifications.marked_read',
  ALL_MARKED_READ: 'notifications.all_marked_read',
  DELETED: 'notifications.deleted',

  // Notification types (content)
  COMMENT_CREATED: 'notifications.comment_created',
  REPLY_CREATED: 'notifications.reply_created',
  REACTION_ADDED: 'notifications.reaction_added',
  USER_JOINED: 'notifications.user_joined',

  // Error messages
  NOT_FOUND: 'notifications.not_found',
} as const;

/**
 * Notifications Validation Messages (i18n keys)
 */
export const NOTIFICATIONS_VALIDATION_MESSAGES = {
  // User ID
  USER_ID_REQUIRED: 'notifications.validation_user_required',
  USER_ID_INVALID: 'notifications.validation_user_invalid',

  // Type
  TYPE_REQUIRED: 'notifications.validation_type_required',
  TYPE_INVALID: 'notifications.validation_type_invalid',

  // Actor
  ACTOR_ID_REQUIRED: 'notifications.validation_actor_required',
  ACTOR_ID_INVALID: 'notifications.validation_actor_invalid',
  ACTOR_NAME_REQUIRED: 'notifications.validation_actorName_required',
  ACTOR_NAME_INVALID: 'notifications.validation_actorName_invalid',

  // Post
  POST_ID_REQUIRED: 'notifications.validation_post_required',
  POST_ID_INVALID: 'notifications.validation_post_invalid',

  // Comment
  COMMENT_ID_INVALID: 'notifications.validation_comment_invalid',
  PARENT_COMMENT_ID_INVALID: 'notifications.validation_parentComment_invalid',

  // Emoji
  EMOJI_INVALID: 'notifications.validation_emoji_invalid',

  // Message
  MESSAGE_REQUIRED: 'notifications.validation_message_required',
  MESSAGE_MAX_LENGTH: 'notifications.validation_message_maxLength',
} as const;

/**
 * Swagger documentation for notifications endpoints
 */
export const NOTIFICATIONS_SWAGGER = {
  GET_ALL: {
    summary: 'Get user notifications with pagination',
    description: 'Retrieve paginated notifications for the authenticated user',
  },
  GET_UNREAD: {
    summary: 'Get unread notifications',
    description: 'Retrieve all unread notifications for the authenticated user',
  },
  GET_UNREAD_COUNT: {
    summary: 'Get count of unread notifications',
    description: 'Get the total count of unread notifications',
  },
  MARK_AS_READ: {
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read',
  },
  MARK_ALL_AS_READ: {
    summary: 'Mark all notifications as read',
    description: 'Mark all notifications for the user as read',
  },
  DELETE: {
    summary: 'Delete notification',
    description: 'Delete a specific notification',
  },
} as const;

/**
 * API Response Descriptions
 */
export const NOTIFICATIONS_RESPONSE_DESCRIPTIONS = {
  LIST: 'List of notifications',
  UNREAD: 'Unread notifications',
  UNREAD_COUNT: 'Count of unread notifications',
  MARKED_READ: 'Notification marked as read',
  ALL_MARKED_READ: 'All notifications marked as read',
  DELETED: 'Notification deleted successfully',
  NOT_FOUND: 'Notification not found',
  UNAUTHORIZED: 'Unauthorized',
} as const;

/**
 * API Parameter Descriptions
 */
export const NOTIFICATIONS_PARAM_DESCRIPTIONS = {
  ID: 'Notification MongoDB ObjectId',
  USER_ID: 'User MongoDB ObjectId',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const NOTIFICATIONS_DTO_DESCRIPTIONS = {
  // Request fields
  USER_ID: 'User ID who will receive the notification',
  TYPE: 'Type of notification (comment_created, reply_created, reaction_added, user_joined)',
  ACTOR_ID: 'User ID of the person triggering the notification',
  ACTOR_NAME: 'Name or username of the person triggering the notification',
  POST_ID: 'Post ID related to the notification',
  COMMENT_ID: 'Optional comment ID (for comment-related notifications)',
  PARENT_COMMENT_ID: 'Optional parent comment ID (for reply notifications)',
  EMOJI: 'Optional emoji (for reaction notifications)',
  MESSAGE: `Notification message (max ${NOTIFICATIONS_CONFIG.MESSAGE_MAX_LENGTH} characters)`,

  // Response fields
  ID: 'Unique notification identifier',
  READ: 'Whether the notification has been read',
  READ_AT: 'Date when the notification was marked as read',
  CREATED_AT: 'Notification creation date',
  UPDATED_AT: 'Last update date',
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const NOTIFICATIONS_EXAMPLES = {
  COMMENT_CREATED: {
    userId: '507f1f77bcf86cd799439011',
    type: 'comment_created',
    actorId: '507f1f77bcf86cd799439012',
    actorName: 'John Doe',
    postId: '507f1f77bcf86cd799439013',
    message: '{0} commented on your post',
  },
  REPLY_CREATED: {
    userId: '507f1f77bcf86cd799439011',
    type: 'reply_created',
    actorId: '507f1f77bcf86cd799439012',
    actorName: 'Jane Smith',
    postId: '507f1f77bcf86cd799439013',
    commentId: '507f1f77bcf86cd799439014',
    message: '{0} replied to your comment',
  },
  REACTION_ADDED: {
    userId: '507f1f77bcf86cd799439011',
    type: 'reaction_added',
    actorId: '507f1f77bcf86cd799439012',
    actorName: 'Bob Wilson',
    postId: '507f1f77bcf86cd799439013',
    commentId: '507f1f77bcf86cd799439014',
    emoji: '👍',
    message: '{0} reacted with {1} to your comment',
  },
} as const;
