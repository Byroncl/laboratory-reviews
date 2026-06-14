import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../schemas/audit-log.schema';
import { IAuditLogRepository, IAuditLog } from '../../interfaces/audit-log.interface';
import { AuditLogMapper } from './audit-log.mapper';
import { AUDIT_PAGINATION } from '../../constants/audit.constants';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
    private mapper: AuditLogMapper,
  ) {}

  async create(log: IAuditLog): Promise<IAuditLog> {
    const created = await this.auditModel.create(log);
    return this.mapper.toResponse(this.mapper.toDomain(created));
  }

  async findById(id: string): Promise<IAuditLog | null> {
    const log = await this.auditModel.findById(id).exec();
    if (!log) return null;
    const entity = this.mapper.toDomain(log);
    return this.mapper.toResponse(entity);
  }

  async findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ items: IAuditLog[]; total: number }> {
    const [items, total] = await Promise.all([
      this.auditModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments({ userId }).exec(),
    ]);

    return {
      items: items.map(item => {
        const entity = this.mapper.toDomain(item);
        return this.mapper.toResponse(entity);
      }),
      total,
    };
  }

  async findAll(
    skip: number,
    limit: number,
    filters?: any,
  ): Promise<{ items: IAuditLog[]; total: number }> {
    const filter = this.buildFilter(filters);

    const [items, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map(item => {
        const entity = this.mapper.toDomain(item);
        return this.mapper.toResponse(entity);
      }),
      total,
    };
  }

  async exportToCsv(): Promise<string> {
    const logs = await this.auditModel.find().sort({ createdAt: -1 }).exec();

    if (logs.length === 0) {
      return 'No records found';
    }

    const headers = [
      'ID',
      'Usuario',
      'Acción',
      'Tipo de Entidad',
      'ID de Entidad',
      'Estado',
      'IP',
      'Mensaje',
      'Fecha',
    ];

    const rows = logs.map(log => [
      log._id?.toString() || '',
      log.userId || '',
      log.action || '',
      log.entityType || '',
      log.entityId || '',
      log.status || '',
      log.ipAddress || '',
      log.message || '',
      log.createdAt?.toISOString() || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  private buildFilter(filters?: any): Record<string, any> {
    const filter: Record<string, any> = {};

    if (filters?.userId) {
      filter.userId = filters.userId;
    }
    if (filters?.action) {
      filter.action = filters.action;
    }
    if (filters?.entityType) {
      filter.entityType = filters.entityType;
    }
    if (filters?.status) {
      filter.status = filters.status;
    }
    if (filters?.startDate && filters?.endDate) {
      filter.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    return filter;
  }
}
