export const ADMIN_ENDPOINTS = {
  USERS: '/users',
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  AUDIT_LOGS: '/audit-logs'
} as const;

export const ADMIN_SUB_ENDPOINTS = {
  STATS: 'stats/overview',
  PROFILE: 'me/profile',
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  PASSWORD: 'password',
  ROLE_ASSIGN: 'role',
  PERMISSIONS_ASSIGN: 'permissions'
} as const;
