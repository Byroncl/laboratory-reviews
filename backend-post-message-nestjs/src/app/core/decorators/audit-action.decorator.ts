import { SetMetadata } from '@nestjs/common';
import {
  AuditAction,
  EntityType,
} from '../../modules/audit/schemas/audit-log.schema';

export const AUDIT_KEY = 'audit_action';

export interface AuditActionOptions {
  action: AuditAction;
  entity: EntityType;
  captureSnapshot?: boolean;
  skipAudit?: boolean;
  metadata?: Record<string, unknown>;
}

export const AuditActionDecorator = (
  action: AuditAction,
  entity: EntityType,
  options?: {
    captureSnapshot?: boolean;
    skipAudit?: boolean;
    metadata?: Record<string, unknown>;
  },
): MethodDecorator =>
  SetMetadata(AUDIT_KEY, {
    action,
    entity,
    captureSnapshot: options?.captureSnapshot ?? false,
    skipAudit: options?.skipAudit ?? false,
    metadata: options?.metadata,
  });
