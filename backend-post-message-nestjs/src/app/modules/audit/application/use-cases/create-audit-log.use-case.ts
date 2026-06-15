import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { IAuditLog } from '../../interfaces/audit-log.interface';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import { AUDIT_VALIDATION_MESSAGES } from '../../constants/audit.constants';

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
      throw new Error(AUDIT_VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
    if (!logData.action) {
      throw new Error(AUDIT_VALIDATION_MESSAGES.ACTION_REQUIRED);
    }
    if (!logData.entityType) {
      throw new Error(AUDIT_VALIDATION_MESSAGES.ENTITY_TYPE_REQUIRED);
    }
    if (!logData.entityId) {
      throw new Error(AUDIT_VALIDATION_MESSAGES.ENTITY_ID_REQUIRED);
    }
    if (!logData.ipAddress) {
      throw new Error(AUDIT_VALIDATION_MESSAGES.IP_ADDRESS_REQUIRED);
    }
    if (!logData.userAgent) {
      throw new Error(AUDIT_VALIDATION_MESSAGES.USER_AGENT_REQUIRED);
    }
  }
}
