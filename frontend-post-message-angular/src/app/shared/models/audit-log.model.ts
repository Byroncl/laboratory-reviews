export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ASSIGN'
  | 'ACTIVATE'
  | 'DEACTIVATE';

export type EntityType =
  | 'user'
  | 'role'
  | 'permission'
  | 'post'
  | 'comment'
  | 'category'
  | 'file'
  | 'client';

export interface AuditLog {
  _id: string;
  userId: string;
  username: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  httpMethod: string;
  path: string;
  ip: string;
  statusCode: number;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogFilter {
  page: number;
  limit: number;
  userId?: string;
  entityType?: EntityType;
  action?: AuditAction;
  from?: string;
  to?: string;
  search?: string;
}

export interface AuditLogPage {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
