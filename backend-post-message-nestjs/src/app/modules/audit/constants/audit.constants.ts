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

// Audit Validation Messages (i18n keys)
export const AUDIT_VALIDATION_MESSAGES = {
  USER_ID_REQUIRED: 'audit.validation_userIdRequired',
  ACTION_REQUIRED: 'audit.validation_actionRequired',
  ENTITY_TYPE_REQUIRED: 'audit.validation_entityTypeRequired',
  ENTITY_ID_REQUIRED: 'audit.validation_entityIdRequired',
  IP_ADDRESS_REQUIRED: 'audit.validation_ipAddressRequired',
  USER_AGENT_REQUIRED: 'audit.validation_userAgentRequired',
};

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
    SUMMARY: 'Get paginated audit logs with optional filters',
    DESCRIPTION: 'Retorna los registros de auditoría paginados y filtrados',
  },
  LOG_BY_ID_ENDPOINT: {
    SUMMARY: 'Get a single audit log entry by ID',
    DESCRIPTION: 'Retorna un registro específico de auditoría',
  },
  LOGS_BY_ENTITY_ENDPOINT: {
    SUMMARY: 'Get all audit logs for a specific entity',
    DESCRIPTION: 'Retorna los registros de auditoría de una entidad específica',
  },
  EXPORT_LOGS_ENDPOINT: {
    SUMMARY: 'Exportar registros de auditoría',
    DESCRIPTION: 'Exporta los registros de auditoría a CSV',
  },
};

// API Response Descriptions
export const AUDIT_RESPONSE_DESCRIPTIONS = {
  SUCCESS_200: 'Paginated audit log list',
  SUCCESS_SINGLE: 'Audit log entry with before/after snapshots',
  SUCCESS_ENTITY: 'Paginated entity-scoped audit logs',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden — requires audits:read permission',
};

// API Parameter Descriptions
export const AUDIT_PARAM_DESCRIPTIONS = {
  ID: 'AuditLog MongoDB ObjectId',
  ENTITY_TYPE: 'Entity type',
  ENTITY_ID: 'Entity ID',
};

// DTO Field Descriptions
export const AUDIT_DTO_DESCRIPTIONS = {
  // AuditLogResponseDto (single entry)
  ID: 'ID único del registro de auditoría',
  USER_ID: 'ID del usuario que realizó la acción',
  ACTION: 'Acción realizada',
  ENTITY_TYPE: 'Tipo de entidad afectada',
  ENTITY_ID: 'ID de la entidad afectada',
  CHANGES: 'Cambios realizados',
  BEFORE: 'Estado anterior',
  AFTER: 'Estado posterior',
  STATUS: 'Estado de la acción',
  IP_ADDRESS: 'Dirección IP del cliente',
  USER_AGENT: 'User Agent del cliente',
  MESSAGE: 'Mensaje descriptivo',
  CREATED_AT: 'Fecha de creación',
  UPDATED_AT: 'Fecha de actualización',
  ELAPSED_TIME: 'Tiempo transcurrido en milisegundos',

  // AuditLogPageResponseDto (pagination)
  DATA: 'Array of audit log entries',
  TOTAL: 'Total number of records',
  PAGE: 'Número de página',
  LIMIT: 'Cantidad de registros por página',
  TOTAL_PAGES: 'Total number of pages',

  // AuditLogQueryDto (filters)
  FILTER_USER_ID: 'Filter by actor userId',
  SEARCH: 'Full-text match on username or path',
  FROM: 'createdAt >= (ISO8601)',
  TO: 'createdAt <= (ISO8601)',
};
