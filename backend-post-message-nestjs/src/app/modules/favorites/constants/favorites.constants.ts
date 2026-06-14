/**
 * Favorites module configuration constants
 */
export const FAVORITES_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Favorites module i18n message keys
 */
export const FAVORITES_MESSAGES = {
  // Success messages
  ADDED: 'favorites.created',
  REMOVED: 'favorites.deleted',

  // Error messages
  NOT_FOUND: 'favorites.not_found',
  POST_NOT_FOUND: 'favorites.post_not_found',
  ALREADY_FAVORITED: 'favorites.already_favorited',
  INVALID_CLIENT_ID: 'favorites.invalid_client_id',
  INVALID_POST_ID: 'favorites.invalid_post_id',
} as const;

/**
 * Favorites Validation Messages (i18n keys)
 */
export const FAVORITES_VALIDATION_MESSAGES = {
  POST_ID_REQUIRED: 'favorites.validation_post_id_required',
  POST_ID_INVALID: 'favorites.validation_post_id_invalid',
  CLIENT_ID_INVALID: 'favorites.invalid_client_id',
  ALREADY_FAVORITED: 'favorites.already_favorited',
} as const;

/**
 * Swagger documentation for favorites endpoints
 */
export const FAVORITES_SWAGGER = {
  ADD: {
    summary: 'Add post to favorites',
    description: 'Add a post to the current user favorites',
  },
  REMOVE: {
    summary: 'Remove from favorites',
    description: 'Remove a post from the current user favorites',
  },
  GET_ALL: {
    summary: "Get user's favorites",
    description: 'Retrieve paginated list of user favorite posts',
  },
  CHECK: {
    summary: 'Check if favorited',
    description: 'Check if a post is in user favorites',
  },
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const FAVORITES_EXAMPLES = {
  ADD_REQUEST: {
    postId: '507f1f77bcf86cd799439011',
  },
  FAVORITE_RESPONSE: {
    _id: '507f1f77bcf86cd799439020',
    clientId: '507f1f77bcf86cd799439010',
    postId: '507f1f77bcf86cd799439011',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  GET_ALL_RESPONSE: {
    data: [
      {
        _id: '507f1f77bcf86cd799439020',
        clientId: '507f1f77bcf86cd799439010',
        postId: '507f1f77bcf86cd799439011',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
  },
  CHECK_RESPONSE: true,
  ERROR_NOT_FOUND: {
    statusCode: 404,
    message: 'Favorite not found',
    error: 'Not Found',
  },
} as const;

/**
 * API Response Descriptions
 */
export const FAVORITES_RESPONSE_DESCRIPTIONS = {
  ADDED: 'Post added to favorites successfully',
  REMOVED: 'Post removed from favorites successfully',
  LIST: 'User favorite posts retrieved successfully',
  CHECKED: 'Favorite status checked successfully',
  NOT_FOUND: 'Favorite not found',
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized',
} as const;

/**
 * API Parameter Descriptions
 */
export const FAVORITES_PARAM_DESCRIPTIONS = {
  POST_ID: 'Post MongoDB ObjectId',
  PAGE: 'Page number for pagination (1-indexed)',
  LIMIT: 'Number of items per page',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const FAVORITES_DTO_DESCRIPTIONS = {
  POST_ID: 'MongoDB ObjectId of the post to add to favorites',
  PAGE: 'Page number for pagination (1-indexed)',
  LIMIT: 'Number of items per page',
} as const;
