import { AuditAction, EntityType, AuditStatus } from '../constants/audit.constants';

export interface IAuditLog {
  _id?: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
  status: AuditStatus;
  ipAddress: string;
  userAgent: string;
  message: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAuditLogRepository {
  create(log: IAuditLog): Promise<IAuditLog>;
  findById(id: string): Promise<IAuditLog | null>;
  findByUserId(userId: string, skip: number, limit: number): Promise<{
    items: IAuditLog[];
    total: number;
  }>;
  findAll(skip: number, limit: number, filters?: any): Promise<{
    items: IAuditLog[];
    total: number;
  }>;
  exportToCsv(): Promise<string>;
}

export interface IAuditLogUseCase {
  createLog(log: Omit<IAuditLog, '_id' | 'createdAt'>): Promise<IAuditLog>;
  getLog(id: string): Promise<IAuditLog | null>;
  getUserLogs(userId: string, page: number, limit: number): Promise<{
    items: IAuditLog[];
    total: number;
    page: number;
    limit: number;
  }>;
  getAllLogs(page: number, limit: number, filters?: any): Promise<{
    items: IAuditLog[];
    total: number;
    page: number;
    limit: number;
  }>;
  exportLogs(): Promise<string>;
}
