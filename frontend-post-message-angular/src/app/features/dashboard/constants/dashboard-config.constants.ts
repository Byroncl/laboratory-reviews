export const DASHBOARD_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  DEFAULTS: {
    CONTENT_PREVIEW_MAX: 150,
    NOTIFICATION_Z_INDEX: 9999,
    TOAST_TIMEOUT_MS: 3000,
  },
  USER_TYPES: [
    { value: 'admin', label: 'dashboard.user_types.admin' },
    { value: 'editor', label: 'dashboard.user_types.editor' },
    { value: 'viewer', label: 'dashboard.user_types.viewer' },
  ],
  USER_STATUSES: [
    { value: 'active', label: 'dashboard.user_statuses.active' },
    { value: 'inactive', label: 'dashboard.user_statuses.inactive' },
    { value: 'suspended', label: 'dashboard.user_statuses.suspended' },
  ],
  POST_STATUSES: [
    { value: 'published', label: 'dashboard.post_statuses.published' },
    { value: 'draft', label: 'dashboard.post_statuses.draft' },
    { value: 'archived', label: 'dashboard.post_statuses.archived' },
  ],
  AUDIT_ACTIONS: [
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'ASSIGN',
    'ACTIVATE',
    'DEACTIVATE',
  ],
  AUDIT_ENTITY_TYPES: [
    'user',
    'role',
    'permission',
    'post',
    'comment',
    'category',
    'file',
    'client',
  ],
  TABLE_COLUMNS: {
    USERS: ['name', 'email', 'role', 'status', 'createdAt', 'actions'],
    POSTS: ['title', 'author', 'status', 'createdAt', 'actions'],
    ROLES: ['name', 'permissions', 'createdAt', 'actions'],
    PERMISSIONS: ['name', 'resource', 'action', 'createdAt', 'actions'],
  },
};

export const DASHBOARD_DEMO_STATS = {
  POSTS_TOTAL: 1234,
  COMMENTS_TOTAL: 3456,
  ACTIVE_USERS: 892,
  GROWTH_PERCENTAGE: 24.8,
  GROWTH_CHANGE_1: '+5.2%',
  GROWTH_CHANGE_2: '+12.5%',
  GROWTH_CHANGE_3: '+8.1%',
};
