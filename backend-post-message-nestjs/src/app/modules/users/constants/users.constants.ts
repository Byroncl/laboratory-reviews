/**
 * Users module configuration constants
 */
export const USERS_CONFIG = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 200,
  EMAIL_MAX_LENGTH: 255,
  TYPE_MIN_LENGTH: 2,
  TYPE_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  DEFAULT_PAGE_SIZE: 10,
} as const;

/**
 * Users module i18n message keys
 */
export const USERS_MESSAGES = {
  // Success messages
  CREATED: 'users.created',
  UPDATED: 'users.updated',
  DELETED: 'users.deleted',
  PASSWORD_CHANGED: 'users.password_changed',
  LANGUAGE_UPDATED: 'users.language_updated',
  ROLE_ASSIGNED: 'users.role_assigned',
  ACTIVATED: 'users.activated',
  DEACTIVATED: 'users.deactivated',

  // Error messages
  NOT_FOUND: 'users.not_found',
  EMAIL_ALREADY_EXISTS: 'users.email_already_exists',
  USERNAME_ALREADY_EXISTS: 'users.username_already_exists',
  INVALID_PASSWORD: 'users.invalid_password',
  PASSWORDS_DO_NOT_MATCH: 'users.passwords_do_not_match',
  LANGUAGE_INVALID: 'users.language_invalid',
} as const;

/**
 * Users Validation Messages (i18n keys)
 */
export const USERS_VALIDATION_MESSAGES = {
  // Name
  NAME_REQUIRED: 'users.validation_name_required',
  NAME_MIN_LENGTH: 'users.validation_name_minLength',
  NAME_MAX_LENGTH: 'users.validation_name_maxLength',
  NAME_STRING: 'users.validation_name_string',
  NAME_PATTERN: 'users.validation_name_pattern',

  // Last name
  LASTNAME_REQUIRED: 'users.validation_lastname_required',
  LASTNAME_MIN_LENGTH: 'users.validation_lastname_minLength',
  LASTNAME_MAX_LENGTH: 'users.validation_lastname_maxLength',
  LASTNAME_STRING: 'users.validation_lastname_string',
  LASTNAME_PATTERN: 'users.validation_lastname_pattern',

  // Username
  USERNAME_REQUIRED: 'users.validation_username_required',
  USERNAME_MIN_LENGTH: 'users.validation_username_minLength',
  USERNAME_MAX_LENGTH: 'users.validation_username_maxLength',
  USERNAME_STRING: 'users.validation_username_string',
  USERNAME_ALPHANUMERIC: 'users.validation_username_alphanumeric',
  USERNAME_UNIQUE: 'users.validation_username_unique',

  // Email
  EMAIL_REQUIRED: 'users.validation_email_required',
  EMAIL_INVALID: 'users.validation_email_invalid',
  EMAIL_MAX_LENGTH: 'users.validation_email_maxLength',
  EMAIL_UNIQUE: 'users.validation_email_unique',

  // Password
  PASSWORD_REQUIRED: 'users.validation_password_required',
  PASSWORD_MIN_LENGTH: 'users.validation_password_minLength',
  PASSWORD_MAX_LENGTH: 'users.validation_password_maxLength',
  PASSWORD_STRING: 'users.validation_password_string',

  // Type
  TYPE_REQUIRED: 'users.validation_type_required',
  TYPE_MIN_LENGTH: 'users.validation_type_minLength',
  TYPE_MAX_LENGTH: 'users.validation_type_maxLength',
  TYPE_STRING: 'users.validation_type_string',

  // Bio
  BIO_MAX_LENGTH: 'users.validation_bio_maxLength',

  // Status
  IS_ACTIVE_INVALID: 'users.validation_isActive_invalid',
  IS_VERIFIED_INVALID: 'users.validation_isVerified_invalid',
} as const;

/**
 * Swagger documentation for users endpoints
 */
export const USERS_SWAGGER = {
  CREATE: {
    summary: 'Create a new user',
    description: 'Create a new user account with email, username, and password',
  },
  FIND_ALL: {
    summary: 'Get all users (paginated)',
    description: 'Retrieve paginated users with optional filters (role, status, email)',
  },
  FIND_ONE: {
    summary: 'Get a user by ID',
    description: 'Retrieve a specific user by their ID',
  },
  UPDATE: {
    summary: 'Update a user',
    description: 'Update user information (name, lastname, bio, avatar)',
  },
  DELETE: {
    summary: 'Delete a user',
    description: 'Delete a user by ID (soft delete)',
  },
  CHANGE_PASSWORD: {
    summary: 'Change user password',
    description: 'Change password with current password verification',
  },
  ASSIGN_ROLE: {
    summary: 'Assign role to user',
    description: 'Assign a role to a specific user',
  },
  ACTIVATE: {
    summary: 'Activate user',
    description: 'Activate a deactivated user account',
  },
  DEACTIVATE: {
    summary: 'Deactivate user',
    description: 'Deactivate a user account',
  },
  SET_LANGUAGE: {
    summary: 'Set language preference',
    description: 'Set the language preference for the authenticated user',
  },
  GET_PROFILE: {
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the authenticated user',
  },
  GET_STATS: {
    summary: 'Get user statistics',
    description: 'Retrieve user statistics (admin only)',
  },
} as const;

/**
 * API Response Descriptions
 */
export const USERS_RESPONSE_DESCRIPTIONS = {
  CREATED: 'User created successfully',
  UPDATED: 'User updated successfully',
  DELETED: 'User deleted successfully',
  FOUND: 'User found',
  LIST: 'List of users',
  PASSWORD_CHANGED: 'Password changed successfully',
  LANGUAGE_UPDATED: 'Language preference updated successfully',
  ROLE_ASSIGNED: 'Role assigned successfully',
  ACTIVATED: 'User activated successfully',
  DEACTIVATED: 'User deactivated successfully',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized',
} as const;

/**
 * API Parameter Descriptions
 */
export const USERS_PARAM_DESCRIPTIONS = {
  ID: 'User MongoDB ObjectId',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const USERS_DTO_DESCRIPTIONS = {
  // Request fields
  NAME: `First name (${USERS_CONFIG.NAME_MIN_LENGTH}-${USERS_CONFIG.NAME_MAX_LENGTH} characters)`,
  LASTNAME: `Last name (${USERS_CONFIG.NAME_MIN_LENGTH}-${USERS_CONFIG.NAME_MAX_LENGTH} characters)`,
  USERNAME: `Unique username (${USERS_CONFIG.USERNAME_MIN_LENGTH}-${USERS_CONFIG.USERNAME_MAX_LENGTH} alphanumeric characters)`,
  EMAIL: 'Valid email address',
  PASSWORD: `Hashed password (${USERS_CONFIG.PASSWORD_MIN_LENGTH}-${USERS_CONFIG.PASSWORD_MAX_LENGTH} characters)`,
  TYPE: `User type (${USERS_CONFIG.TYPE_MIN_LENGTH}-${USERS_CONFIG.TYPE_MAX_LENGTH} characters)`,
  BIO: `User biography (max ${USERS_CONFIG.BIO_MAX_LENGTH} characters)`,
  AVATAR: 'Avatar URL',

  // Response fields
  ID: 'Unique user identifier',
  IS_ACTIVE: 'Whether the user account is active',
  IS_VERIFIED: 'Whether the email is verified',
  CREATED_AT: 'User account creation date',
  UPDATED_AT: 'Last update date',
  ROLE: 'Assigned role',

  // Change password
  OLD_PASSWORD: 'Current password for verification',
  NEW_PASSWORD: 'New password (hashed)',

  // Assign role
  ROLE_ID: 'Role MongoDB ObjectId',
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const USERS_EXAMPLES = {
  CREATE_REQUEST: {
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed_password_here',
    type: 'user',
  },
  USER_RESPONSE: {
    id: '507f1f77bcf86cd799439011',
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    type: 'user',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'A passionate developer',
    isActive: true,
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
} as const;

/**
 * User types
 */
export const USER_TYPES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
} as const;

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  ES: 'es',
} as const;
