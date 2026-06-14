import { Injectable } from '@nestjs/common';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import { AuditLogResponseDto } from '../../application/dtos/audit-log-response.dto';

@Injectable()
export class AuditLogMapper {
  toDomain(raw: any): AuditLogEntity {
    return new AuditLogEntity({
      _id: raw._id?.toString(),
      userId: raw.userId,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      changes: raw.changes,
      before: raw.before,
      after: raw.after,
      status: raw.status,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      message: raw.message,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  toResponse(entity: AuditLogEntity): AuditLogResponseDto {
    return {
      id: entity._id,
      userId: entity.userId,
      action: entity.action,
      entityType: entity.entityType,
      entityId: entity.entityId,
      changes: entity.changes,
      before: entity.before,
      after: entity.after,
      status: entity.status,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      message: entity.message,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      elapsedTime: entity.getElapsedTime(),
    };
  }

  toPersistence(entity: AuditLogEntity): any {
    return {
      userId: entity.userId,
      action: entity.action,
      entityType: entity.entityType,
      entityId: entity.entityId,
      changes: entity.changes,
      before: entity.before,
      after: entity.after,
      status: entity.status,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      message: entity.message,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
