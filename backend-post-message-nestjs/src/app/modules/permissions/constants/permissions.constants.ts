/**
 * Permissions module configuration constants
 */
export const PERMISSIONS_CONFIG = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
} as const;

/**
 * Permission types
 */
export const PERMISSION_TYPES = {
  USER: 'user',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  COMMENTS: 'comments',
  CLIENTS: 'clients',
  STATISTICS: 'statistics',
  AUDITS: 'audits',
} as const;

/**
 * Permissions module i18n message keys
 */
export const PERMISSIONS_MESSAGES = {
  // Success messages
  CREATED: 'permissions.created',
  UPDATED: 'permissions.updated',
  DELETED: 'permissions.deleted',

  // Error messages
  NOT_FOUND: 'permissions.not_found',
  ALREADY_EXISTS: 'permissions.already_exists',
} as const;

/**
 * Permissions Validation Messages (i18n keys)
 */
export const PERMISSIONS_VALIDATION_MESSAGES = {
  // Name
  NAME_REQUIRED: 'permissions.validation_name_required',
  NAME_MIN_LENGTH: 'permissions.validation_name_minLength',
  NAME_MAX_LENGTH: 'permissions.validation_name_maxLength',
  NAME_STRING: 'permissions.validation_name_string',

  // Identifier
  IDENTIFIER_REQUIRED: 'permissions.validation_identifier_required',
  IDENTIFIER_STRING: 'permissions.validation_identifier_string',
  IDENTIFIER_UNIQUE: 'permissions.validation_identifier_unique',

  // Type
  TYPE_REQUIRED: 'permissions.validation_type_required',
  TYPE_INVALID: 'permissions.validation_type_invalid',

  // Status
  IS_ACTIVE_INVALID: 'permissions.validation_isActive_invalid',
} as const;

/**
 * Swagger documentation for permissions endpoints
 */
export const PERMISSIONS_SWAGGER = {
  CREATE: {
    summary: 'Create a new permission',
    description: 'Create a new permission with name, identifier, and type',
  },
  FIND_ALL: {
    summary: 'Get all permissions',
    description: 'Retrieve all permissions',
  },
  FIND_ONE: {
    summary: 'Get a permission by ID',
    description: 'Retrieve a specific permission by its ID',
  },
  UPDATE: {
    summary: 'Update a permission',
    description: 'Update permission name, identifier, or type',
  },
  DELETE: {
    summary: 'Delete a permission',
    description: 'Delete a permission by ID',
  },
} as const;

/**
 * API Response Descriptions
 */
export const PERMISSIONS_RESPONSE_DESCRIPTIONS = {
  CREATED: 'Permission created successfully',
  UPDATED: 'Permission updated successfully',
  DELETED: 'Permission deleted successfully',
  FOUND: 'Permission found',
  LIST: 'List of permissions',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Permission not found',
  UNAUTHORIZED: 'Unauthorized',
} as const;

/**
 * API Parameter Descriptions
 */
export const PERMISSIONS_PARAM_DESCRIPTIONS = {
  ID: 'Permission MongoDB ObjectId',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const PERMISSIONS_DTO_DESCRIPTIONS = {
  // Request fields
  NAME: `Permission display name (${PERMISSIONS_CONFIG.NAME_MIN_LENGTH}-${PERMISSIONS_CONFIG.NAME_MAX_LENGTH} characters)`,
  IDENTIFIER: 'Unique identifier for the permission (e.g., "create_user")',
  TYPE: 'Category/type of the permission (user, roles, permissions, comments, clients, statistics, audits)',
  IS_ACTIVE: 'Whether the permission is active',

  // Response fields
  ID: 'Unique permission identifier',
  CREATED_AT: 'Permission creation date',
  UPDATED_AT: 'Last update date',
  IS_DELETED: 'Whether the permission is deleted (soft delete)',
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const PERMISSIONS_EXAMPLES = {
  CREATE_REQUEST: {
    name: 'Create User',
    identifier: 'create_user',
    type: 'user',
  },
  PERMISSION_RESPONSE: {
    id: '507f1f77bcf86cd799439011',
    name: 'Create User',
    identifier: 'create_user',
    type: 'user',
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
} as const;
