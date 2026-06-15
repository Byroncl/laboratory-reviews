/**
 * Roles module configuration constants
 */
export const ROLES_CONFIG = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Roles module i18n message keys
 */
export const ROLES_MESSAGES = {
  // Success messages
  CREATED: 'roles.created',
  UPDATED: 'roles.updated',
  DELETED: 'roles.deleted',
  PERMISSIONS_ASSIGNED: 'roles.permissions_assigned',

  // Error messages
  NOT_FOUND: 'roles.not_found',
} as const;

/**
 * Roles Validation Messages (i18n keys)
 */
export const ROLES_VALIDATION_MESSAGES = {
  NAME_REQUIRED: 'roles.validation_name_required',
  NAME_MIN_LENGTH: 'roles.validation_name_minLength',
  NAME_MAX_LENGTH: 'roles.validation_name_maxLength',
  NAME_INVALID: 'roles.validation_name_invalid',
  DESCRIPTION_MAX_LENGTH: 'roles.validation_description_maxLength',
  PERMISSION_ID_REQUIRED: 'roles.validation_permission_id_required',
  PERMISSION_ID_INVALID: 'roles.validation_permission_id_invalid',
} as const;

/**
 * Swagger documentation for roles endpoints
 */
export const ROLES_SWAGGER = {
  CREATE: {
    summary: 'Create a new role',
    description: 'Create a new role with name and description',
  },
  FIND_ALL: {
    summary: 'Get all roles',
    description: 'Retrieve all roles, optionally filtered by name',
  },
  FIND_ONE: {
    summary: 'Get role by ID',
    description: 'Retrieve a specific role with its permissions',
  },
  UPDATE: {
    summary: 'Update a role',
    description: 'Update role name and/or description',
  },
  DELETE: {
    summary: 'Delete a role',
    description: 'Delete a role by ID',
  },
  ASSIGN_PERMISSIONS: {
    summary: 'Assign permissions to role',
    description: 'Assign multiple permissions to a role',
  },
  HAS_PERMISSION: {
    summary: 'Check if role has permission',
    description: 'Check if a role has a specific permission',
  },
} as const;

/**
 * Example payloads for Swagger documentation
 */
export const ROLES_EXAMPLES = {
  CREATE_REQUEST: {
    name: 'Admin',
    description: 'Administrator role with full access',
  },
  ROLE_RESPONSE: {
    _id: '507f1f77bcf86cd799439011',
    name: 'Admin',
    identifier: 'admin',
    description: 'Administrator role with full access',
    permissions: [
      {
        _id: '507f1f77bcf86cd799439020',
        name: 'Read Posts',
        identifier: 'read_posts',
        description: 'Can read all posts',
      },
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  ASSIGN_PERMISSIONS_REQUEST: {
    permissionIds: [
      '507f1f77bcf86cd799439020',
      '507f1f77bcf86cd799439021',
    ],
  },
  ERROR_NOT_FOUND: {
    statusCode: 404,
    message: 'Role not found',
    error: 'Not Found',
  },
} as const;

/**
 * API Response Descriptions
 */
export const ROLES_RESPONSE_DESCRIPTIONS = {
  CREATED: 'Role created successfully',
  UPDATED: 'Role updated successfully',
  DELETED: 'Role deleted successfully',
  FOUND: 'Role found',
  LIST: 'List of roles',
  PERMISSIONS_ASSIGNED: 'Permissions assigned successfully',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Role not found',
  UNAUTHORIZED: 'Unauthorized',
} as const;

/**
 * API Parameter Descriptions
 */
export const ROLES_PARAM_DESCRIPTIONS = {
  ID: 'Role MongoDB ObjectId',
  NAME: 'Role name filter (optional)',
} as const;

/**
 * DTO field descriptions for Swagger
 */
export const ROLES_DTO_DESCRIPTIONS = {
  NAME: `Role name (${ROLES_CONFIG.NAME_MIN_LENGTH}-${ROLES_CONFIG.NAME_MAX_LENGTH} characters)`,
  IDENTIFIER: 'Generated identifier (lowercase with hyphens)',
  DESCRIPTION: `Role description (max ${ROLES_CONFIG.DESCRIPTION_MAX_LENGTH} characters)`,
  PERMISSIONS: 'Array of permission IDs to assign to the role',
  PERMISSION_IDENTIFIER: 'Permission identifier to check (e.g., "read_posts")',
} as const;

/**
 * Default system roles
 */
export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  CLIENT: 'client',
  MODERATOR: 'moderator',
  VIEWER: 'viewer',
} as const;
