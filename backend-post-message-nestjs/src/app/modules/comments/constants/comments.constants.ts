/**
 * Comments module configuration constants
 */
export const COMMENTS_CONFIG = {
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 5000,
  MAX_NESTING_LEVEL: 2,
  DEFAULT_PAGE_SIZE: 10,
} as const;

/**
 * Comments module i18n message keys
 */
export const COMMENTS_MESSAGES = {
  // Success messages
  CREATED: 'comments.created',
  UPDATED: 'comments.updated',
  DELETED: 'comments.deleted',
  THREAD_RETRIEVED: 'comments.thread_retrieved',

  // Error messages
  NOT_FOUND: 'comments.not_found',
  PARENT_NOT_FOUND: 'comments.parent_not_found',
  MAX_NESTING_LEVEL: 'comments.max_nesting_level',
  INVALID_POST: 'comments.invalid_post',
  UNAUTHORIZED_DELETE: 'comments.unauthorized_delete',

  // Reactions
  REACTION_ADDED: 'comments.reaction_added',
  REACTION_REMOVED: 'comments.reaction_removed',
  INVALID_EMOJI: 'comments.invalid_emoji',
} as const;

/**
 * Comments Validation Messages (i18n keys)
 */
export const COMMENTS_VALIDATION_MESSAGES = {
  // Content
  CONTENT_REQUIRED: 'comments.validation_content_required',
  CONTENT_MIN_LENGTH: 'comments.validation_content_minLength',
  CONTENT_MAX_LENGTH: 'comments.validation_content_maxLength',

  // Post
  POST_ID_REQUIRED: 'comments.validation_post_required',
  POST_ID_INVALID: 'comments.validation_post_invalid',

  // Parent Comment
  PARENT_COMMENT_ID_INVALID: 'comments.validation_parentComment_invalid',
  PARENT_COMMENT_NOT_FOUND: 'comments.validation_parentComment_notFound',
  NESTING_LEVEL_EXCEEDED: 'comments.validation_nesting_level_exceeded',

  // User
  USER_ID_REQUIRED: 'comments.validation_user_required',
  USER_ID_INVALID: 'comments.validation_user_invalid',

  // Media
  MEDIA_URLS_INVALID: 'comments.validation_media_invalid',

  // Reactions
  EMOJI_INVALID: 'comments.validation_emoji_invalid',
} as const;

/**
 * Swagger documentation for comments endpoints
 */
export const COMMENTS_SWAGGER = {
  CREATE: {
    summary: 'Create a new comment',
    description: 'Create a comment on a post or reply to an existing comment',
  },
  FIND_ALL: {
    summary: 'Get all comments',
    description: 'Retrieve all comments, optionally filtered by post',
  },
  FIND_ONE: {
    summary: 'Get comment by ID',
    description: 'Retrieve a specific comment with its replies',
  },
  FIND_BY_USER: {
    summary: "Get user's comments",
    description: 'Retrieve paginated comments by a specific user',
  },
  UPDATE: {
    summary: 'Update a comment',
    description: 'Update the content and/or media of a comment',
  },
  DELETE: {
    summary: 'Delete a comment',
    description: 'Delete a comment and its cascade replies',
  },
  GET_THREAD: {
    summary: 'Get comment thread',
    description: 'Get the full thread for a comment (root and all replies)',
  },
  GET_REPLIES: {
    summary: 'Get replies to a comment',
    description: 'Get paginated replies to a specific comment',
  },
  ADD_REACTION: {
    summary: 'Add reaction to comment',
    description: 'Add an emoji reaction to a comment',
  },
  REMOVE_REACTION: {
    summary: 'Remove reaction from comment',
    description: 'Remove an emoji reaction from a comment',
  },
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const COMMENTS_EXAMPLES = {
  CREATE_REQUEST: {
    postId: '507f1f77bcf86cd799439011',
    content: 'Great post! Very informative.',
    userId: '507f1f77bcf86cd799439012',
    mediaUrls: [],
  },
  CREATE_REPLY_REQUEST: {
    postId: '507f1f77bcf86cd799439011',
    content: 'Thanks for the comment!',
    userId: '507f1f77bcf86cd799439012',
    parentCommentId: '507f1f77bcf86cd799439013',
    mediaUrls: [],
  },
  UPDATE_REQUEST: {
    content: 'Updated comment content',
    mediaUrls: ['https://example.com/image.jpg'],
    mediaTypes: ['image/jpeg'],
    mediaFilenames: ['image.jpg'],
  },
  COMMENT_RESPONSE: {
    id: '507f1f77bcf86cd799439011',
    content: 'Great post! Very informative.',
    post: '507f1f77bcf86cd799439010',
    isActive: true,
    parentCommentId: null,
    childCommentIds: ['507f1f77bcf86cd799439013'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    media: [],
  },
  REACTION_REQUEST: {
    emoji: '👍',
  },
  ERROR_NOT_FOUND: {
    statusCode: 404,
    message: 'Comment not found',
    error: 'Not Found',
  },
} as const;

/**
 * API Response Descriptions
 */
export const COMMENTS_RESPONSE_DESCRIPTIONS = {
  CREATED: 'Comment created successfully',
  UPDATED: 'Comment updated successfully',
  DELETED: 'Comment deleted successfully',
  FOUND: 'Comment found',
  LIST: 'List of comments',
  THREAD: 'Comment thread retrieved successfully',
  REPLIES: 'Replies to comment',
  REACTION_ADDED: 'Reaction added successfully',
  REACTION_REMOVED: 'Reaction removed successfully',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Comment not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
} as const;

/**
 * API Parameter Descriptions
 */
export const COMMENTS_PARAM_DESCRIPTIONS = {
  ID: 'Comment MongoDB ObjectId',
  POST_ID: 'Post MongoDB ObjectId',
  USER_ID: 'User MongoDB ObjectId',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const COMMENTS_DTO_DESCRIPTIONS = {
  // Request fields
  CONTENT: `Comment content (${COMMENTS_CONFIG.CONTENT_MIN_LENGTH}-${COMMENTS_CONFIG.CONTENT_MAX_LENGTH} characters)`,
  POST_ID: 'MongoDB ObjectId of the post this comment belongs to',
  USER_ID: 'MongoDB ObjectId of the user who created this comment',
  PARENT_COMMENT_ID: 'Optional parent comment ID for replies',
  MEDIA_URLS: 'Array of URLs for attached media (images, videos)',
  MEDIA_TYPES: 'Array of MIME types corresponding to media URLs',
  MEDIA_FILENAMES: 'Array of original filenames for media',

  // Response fields
  ID: 'Unique comment identifier',
  IS_ACTIVE: 'Whether the comment is active',
  CHILD_COMMENTS: 'Array of child comment IDs (replies)',
  CREATED_AT: 'Comment creation date',
  UPDATED_AT: 'Last update date',

  // Reaction fields
  EMOJI: 'Reaction emoji (👍, ❤️, 😂, 😮, 😢, 😡)',
} as const;

/**
 * Allowed emoji reactions
 */
export const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'] as const;
