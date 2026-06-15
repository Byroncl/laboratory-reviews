import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ASSIGN = 'ASSIGN',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
}

export enum EntityType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  POST = 'post',
  COMMENT = 'comment',
  CATEGORY = 'category',
  FILE = 'file',
  CLIENT = 'client',
}

const AUDIT_LOG_TTL_DAYS = parseInt(process.env.AUDIT_LOG_TTL_DAYS ?? '90', 10);
const TTL_SECONDS = AUDIT_LOG_TTL_DAYS * 24 * 60 * 60;

@Schema({
  collection: 'audit_logs',
  timestamps: { createdAt: 'createdAt', updatedAt: false },
})
export class AuditLog extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, enum: Object.values(AuditAction), index: true })
  action: AuditAction;

  @Prop({ required: true, enum: Object.values(EntityType) })
  entityType: EntityType;

  @Prop({ index: true })
  entityId?: string;

  @Prop({ required: true })
  httpMethod: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ type: Object })
  before?: Record<string, unknown>;

  @Prop({ type: Object })
  after?: Record<string, unknown>;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Date, index: { expireAfterSeconds: TTL_SECONDS } })
  createdAt: Date;
}

export type AuditLogDocument = AuditLog & Document;

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Compound index for entity-scoped queries
AuditLogSchema.index({ entityType: 1, entityId: 1 });
// Default sort index
AuditLogSchema.index({ createdAt: -1 });
