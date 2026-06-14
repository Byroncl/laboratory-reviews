/**
 * Posts module configuration constants
 */
export const POSTS_CONFIG = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 5000,
  IMAGE_FILENAME_MAX_LENGTH: 500,
  CATEGORY_NAME_MIN_LENGTH: 1,
  CATEGORY_NAME_MAX_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 10,
} as const;

/**
 * Posts module i18n message keys
 */
export const POSTS_MESSAGES = {
  // Success messages
  CREATED: 'posts.created',
  UPDATED: 'posts.updated',
  DELETED: 'posts.deleted',

  // Error messages
  NOT_FOUND: 'posts.not_found',
  INVALID_CATEGORY: 'posts.invalid_category',
  UNAUTHORIZED_DELETE: 'posts.unauthorized_delete',
} as const;

/**
 * Posts Validation Messages (i18n keys)
 */
export const POSTS_VALIDATION_MESSAGES = {
  // Title
  TITLE_REQUIRED: 'posts.validation_title_required',
  TITLE_MIN_LENGTH: 'posts.validation_title_minLength',
  TITLE_MAX_LENGTH: 'posts.validation_title_maxLength',
  TITLE_STRING: 'posts.validation_title_string',

  // Content
  CONTENT_REQUIRED: 'posts.validation_content_required',
  CONTENT_MIN_LENGTH: 'posts.validation_content_minLength',
  CONTENT_MAX_LENGTH: 'posts.validation_content_maxLength',
  CONTENT_STRING: 'posts.validation_content_string',

  // Image
  IMAGE_URL_INVALID: 'posts.validation_image_invalid',
  IMAGE_FILENAME_INVALID: 'posts.validation_image_filename_invalid',
  IMAGE_FILENAME_MAX_LENGTH: 'posts.validation_image_filename_maxLength',

  // Category
  CATEGORY_ID_INVALID: 'posts.validation_category_invalid',
  CATEGORY_NAME_INVALID: 'posts.validation_category_name_invalid',
  CATEGORY_NAME_MIN_LENGTH: 'posts.validation_category_name_minLength',
  CATEGORY_NAME_MAX_LENGTH: 'posts.validation_category_name_maxLength',

  // Author
  AUTHOR_ID_REQUIRED: 'posts.validation_author_required',
  AUTHOR_ID_INVALID: 'posts.validation_author_invalid',
} as const;

/**
 * Swagger documentation for posts endpoints
 */
export const POSTS_SWAGGER = {
  CREATE: {
    summary: 'Create a new post',
    description: 'Create a new post with title, content, and optional image and category',
  },
  FIND_ALL: {
    summary: 'Get all posts (paginated)',
    description: 'Retrieve paginated posts with optional filters (category, status, author, search)',
  },
  FIND_ONE: {
    summary: 'Get a post by ID',
    description: 'Retrieve a specific post by its ID',
  },
  FIND_BY_AUTHOR: {
    summary: "Get user's posts",
    description: 'Retrieve paginated posts created by a specific user',
  },
  UPDATE: {
    summary: 'Update a post',
    description: 'Update post content, title, image, or category',
  },
  DELETE: {
    summary: 'Delete a post',
    description: 'Delete a post by ID (soft delete)',
  },
} as const;

/**
 * API Response Descriptions
 */
export const POSTS_RESPONSE_DESCRIPTIONS = {
  CREATED: 'Post created successfully',
  UPDATED: 'Post updated successfully',
  DELETED: 'Post deleted successfully',
  FOUND: 'Post found',
  LIST: 'List of posts',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Post not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
} as const;

/**
 * API Parameter Descriptions
 */
export const POSTS_PARAM_DESCRIPTIONS = {
  ID: 'Post MongoDB ObjectId',
  CATEGORY_ID: 'Category MongoDB ObjectId',
  AUTHOR_ID: 'Author MongoDB ObjectId',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const POSTS_DTO_DESCRIPTIONS = {
  // Request fields
  TITLE: `Post title (${POSTS_CONFIG.TITLE_MIN_LENGTH}-${POSTS_CONFIG.TITLE_MAX_LENGTH} characters)`,
  CONTENT: `Post content (${POSTS_CONFIG.CONTENT_MIN_LENGTH}-${POSTS_CONFIG.CONTENT_MAX_LENGTH} characters)`,
  IMAGE_URL: 'Valid URL of the post image',
  IMAGE_FILENAME: `MinIO filename for the image (${POSTS_CONFIG.IMAGE_FILENAME_MAX_LENGTH} max characters)`,
  CATEGORY_ID: 'MongoDB ObjectId of the category',
  CATEGORY_NAME: `Denormalized category name (${POSTS_CONFIG.CATEGORY_NAME_MIN_LENGTH}-${POSTS_CONFIG.CATEGORY_NAME_MAX_LENGTH} characters)`,

  // Response fields
  ID: 'Unique post identifier',
  AUTHOR_ID: 'ID of the post author',
  AUTHOR: 'Name or username of the author',
  AUTHOR_AVATAR: 'Avatar URL of the author',
  IS_ACTIVE: 'Whether the post is active',
  IS_DELETED: 'Whether the post is deleted (soft delete)',
  STATUS: 'Post status (draft, published, archived)',
  CREATED_AT: 'Post creation date',
  UPDATED_AT: 'Last update date',
  COMMENTS_COUNT: 'Number of comments on the post',
  LIKES_COUNT: 'Number of likes on the post',
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const POSTS_EXAMPLES = {
  CREATE_REQUEST: {
    title: 'My First Blog Post',
    content: 'This is the content of my first blog post...',
    imageUrl: 'http://localhost:9000/posts/1718000000000-photo.jpg',
    imageFilename: '1718000000000-photo.jpg',
    categoryId: '507f1f77bcf86cd799439011',
    categoryName: 'Technology',
  },
  POST_RESPONSE: {
    id: '507f1f77bcf86cd799439011',
    title: 'My First Blog Post',
    content: 'This is the content of my first blog post...',
    imageUrl: 'http://localhost:9000/posts/1718000000000-photo.jpg',
    imageFilename: '1718000000000-photo.jpg',
    categoryId: '507f1f77bcf86cd799439012',
    categoryName: 'Technology',
    authorId: '507f1f77bcf86cd799439013',
    author: 'John Doe',
    isActive: true,
    isDeleted: false,
    status: 'published',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    commentsCount: 5,
    likesCount: 10,
  },
} as const;

/**
 * Post statuses
 */
export const POST_STATUSES = ['draft', 'published', 'archived'] as const;
