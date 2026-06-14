import { AuditAction, EntityType, AuditStatus } from '../../constants/audit.constants';

export class AuditLogEntity {
  readonly _id?: string;
  readonly userId: string;
  readonly action: AuditAction;
  readonly entityType: EntityType;
  readonly entityId: string;
  readonly changes?: Record<string, any>;
  readonly before?: Record<string, any>;
  readonly after?: Record<string, any>;
  readonly status: AuditStatus;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly message: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
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
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props._id;
    this.userId = props.userId;
    this.action = props.action;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.changes = props.changes;
    this.before = props.before;
    this.after = props.after;
    this.status = props.status;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.message = props.message;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  isSuccess(): boolean {
    return this.status === AuditStatus.SUCCESS;
  }

  isFailed(): boolean {
    return this.status === AuditStatus.FAILURE;
  }

  getElapsedTime(): number {
    if (!this.updatedAt) return 0;
    return this.updatedAt.getTime() - this.createdAt.getTime();
  }
}
