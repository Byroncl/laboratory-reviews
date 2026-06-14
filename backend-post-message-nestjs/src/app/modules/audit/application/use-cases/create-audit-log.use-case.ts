import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { IAuditLog } from '../../interfaces/audit-log.interface';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';

@Injectable()
export class CreateAuditLogUseCase {
  constructor(private auditLogRepository: AuditLogRepository) {}

  async execute(logData: Omit<IAuditLog, '_id' | 'createdAt'>): Promise<IAuditLog> {
    // Validar datos requeridos
    this.validateLogData(logData);

    // Crear entidad de dominio
    const auditLog = new AuditLogEntity(logData as any);

    // Persistir en repositorio
    return this.auditLogRepository.create(auditLog as any);
  }

  private validateLogData(logData: any): void {
    if (!logData.userId) {
      throw new Error('userId es requerido');
    }
    if (!logData.action) {
      throw new Error('action es requerido');
    }
    if (!logData.entityType) {
      throw new Error('entityType es requerido');
    }
    if (!logData.entityId) {
      throw new Error('entityId es requerido');
    }
    if (!logData.ipAddress) {
      throw new Error('ipAddress es requerido');
    }
    if (!logData.userAgent) {
      throw new Error('userAgent es requerido');
    }
  }
}
