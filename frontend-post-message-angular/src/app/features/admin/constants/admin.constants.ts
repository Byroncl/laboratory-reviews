export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export type UserStatusType = typeof USER_STATUSES[keyof typeof USER_STATUSES];

export const ROLE_FILTER_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: 'Admin' },
  { value: USER_ROLES.EDITOR, label: 'Editor' },
  { value: USER_ROLES.VIEWER, label: 'Viewer' }
] as const;

export const STATUS_FILTER_OPTIONS = [
  { value: USER_STATUSES.ACTIVE, label: 'Activo' },
  { value: USER_STATUSES.INACTIVE, label: 'Inactivo' },
  { value: USER_STATUSES.SUSPENDED, label: 'Suspendido' }
] as const;

export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage'
} as const;

export type PermissionActionType = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];
