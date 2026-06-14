// Audit Actions
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

// Entity Types
export enum EntityType {
  USER = 'USER',
  POST = 'POST',
  COMMENT = 'COMMENT',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  CLIENT = 'CLIENT',
  CATEGORY = 'CATEGORY',
  FILE = 'FILE',
}

// Audit Log Messages
export const AUDIT_MESSAGES = {
  [AuditAction.CREATE]: 'Recurso creado exitosamente',
  [AuditAction.UPDATE]: 'Recurso actualizado exitosamente',
  [AuditAction.DELETE]: 'Recurso eliminado exitosamente',
  [AuditAction.READ]: 'Recurso consultado',
  [AuditAction.EXPORT]: 'Datos exportados',
  [AuditAction.IMPORT]: 'Datos importados',
  [AuditAction.LOGIN]: 'Sesión iniciada',
  [AuditAction.LOGOUT]: 'Sesión cerrada',
  [AuditAction.PERMISSION_DENIED]: 'Acceso denegado',
} as const;

// Audit Status
export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}

// Audit Collection Name
export const AUDIT_COLLECTION = 'audit_logs';

// Audit Indexes
export const AUDIT_INDEXES = {
  userId: { userId: 1 },
  createdAt: { createdAt: -1 },
  action: { action: 1 },
  entityType: { entityType: 1 },
  compound: { userId: 1, createdAt: -1, action: 1 },
};

// Pagination Defaults
export const AUDIT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Swagger Documentation
export const AUDIT_SWAGGER = {
  LOGS_ENDPOINT: {
    SUMMARY: 'Obtener registros de auditoría',
    DESCRIPTION: 'Retorna los registros de auditoría paginados y filtrados',
  },
  LOG_BY_ID_ENDPOINT: {
    SUMMARY: 'Obtener un registro de auditoría por ID',
    DESCRIPTION: 'Retorna un registro específico de auditoría',
  },
  LOGS_BY_USER_ENDPOINT: {
    SUMMARY: 'Obtener registros de auditoría por usuario',
    DESCRIPTION: 'Retorna los registros de auditoría de un usuario específico',
  },
  EXPORT_LOGS_ENDPOINT: {
    SUMMARY: 'Exportar registros de auditoría',
    DESCRIPTION: 'Exporta los registros de auditoría a CSV',
  },
};
