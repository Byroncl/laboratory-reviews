import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditAction, EntityType } from '../schemas/audit-log.schema';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

export interface CreateAuditLogInput {
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
}

@Injectable()
export class AuditService {
  private readonly modelRegistry: Map<EntityType, Model<any>>;

  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {
    this.modelRegistry = new Map();
  }

  /**
   * Register an entity model for snapshot capture.
   * Called by AuditModule after construction.
   */
  registerModel(entityType: EntityType, model: Model<any>): void {
    this.modelRegistry.set(entityType, model);
  }

  /**
   * Fire-and-forget save. Errors are swallowed to never affect request handling.
   */
  log(entry: CreateAuditLogInput): void {
    this.auditLogModel.create(entry).catch(() => {
      // intentionally swallowed — audit write must never disrupt request flow
    });
  }

  async queryAudits(q: AuditLogQueryDto): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: Record<string, unknown> = {};

    if (q.userId) filter['userId'] = q.userId;
    if (q.entityType) filter['entityType'] = q.entityType;
    if (q.action) filter['action'] = q.action;

    if (q.from || q.to) {
      const dateFilter: Record<string, Date> = {};
      if (q.from) dateFilter['$gte'] = new Date(q.from);
      if (q.to) dateFilter['$lte'] = new Date(q.to);
      filter['createdAt'] = dateFilter;
    }

    if (q.search) {
      const regex = new RegExp(q.search, 'i');
      filter['$or'] = [{ username: regex }, { path: regex }];
    }

    const skip = (q.page - 1) * q.limit;
    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(q.limit)
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit),
    };
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.auditLogModel.findById(id).exec();
  }

  async findByEntity(
    entityType: EntityType,
    entityId: string,
    q: AuditLogQueryDto,
  ): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.queryAudits({ ...q, entityType, userId: undefined } as AuditLogQueryDto & {
      entityId?: string;
    });
  }

  /**
   * Pre-fetch entity snapshot for UPDATE diff.
   * Returns null when model is not registered or entity not found.
   */
  async snapshotEntity(
    entityType: EntityType,
    id: string,
  ): Promise<Record<string, unknown> | null> {
    const model = this.modelRegistry.get(entityType);
    if (!model) return null;

    try {
      const doc = await model.findById(id).lean().exec();
      return doc as Record<string, unknown> | null;
    } catch {
      return null;
    }
  }
}
