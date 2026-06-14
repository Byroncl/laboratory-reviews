import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  AuditLog,
  AuditLogFilter,
  AuditLogPage,
  EntityType
} from '../../../shared/models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  readonly auditLogs$ = signal<AuditLog[]>([]);
  readonly loading$ = signal<boolean>(false);
  readonly error$ = signal<string | null>(null);

  readonly pagination = signal<{ page: number; limit: number; total: number; totalPages: number }>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  readonly totalPages = computed(() => this.pagination().totalPages);
  readonly currentPage = computed(() => this.pagination().page);

  constructor(private api: ApiService) {
    console.log('[AuditLogService] initialized');
  }

  getAuditLogs(filter: AuditLogFilter): Observable<AuditLogPage> {
    console.log('[AuditLogService] getAuditLogs', filter);
    this.loading$.set(true);
    this.error$.set(null);

    const params = this.buildParams(filter);

    return this.api.get<AuditLogPage>('/audit-logs', params).pipe(
      tap(response => {
        this.auditLogs$.set(response.data ?? []);
        this.pagination.set({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        });
        this.loading$.set(false);
        console.log('[AuditLogService] getAuditLogs success', { total: response.total });
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to load audit logs';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[AuditLogService] getAuditLogs error', err);
        return throwError(() => err);
      })
    );
  }

  getAuditLogById(id: string): Observable<AuditLog> {
    console.log('[AuditLogService] getAuditLogById', id);
    return this.api.get<AuditLog>(`/audit-logs/${id}`).pipe(
      catchError(err => {
        console.error('[AuditLogService] getAuditLogById error', err);
        return throwError(() => err);
      })
    );
  }

  getAuditLogsByEntity(
    entityType: EntityType,
    entityId: string,
    filter?: Partial<AuditLogFilter>
  ): Observable<AuditLogPage> {
    console.log('[AuditLogService] getAuditLogsByEntity', { entityType, entityId, filter });
    this.loading$.set(true);
    this.error$.set(null);

    const params = this.buildParams({
      page: 1,
      limit: 20,
      ...filter
    });

    return this.api.get<AuditLogPage>(`/audit-logs/entity/${entityType}/${entityId}`, params).pipe(
      tap(response => {
        this.auditLogs$.set(response.data ?? []);
        this.pagination.set({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        });
        this.loading$.set(false);
      }),
      catchError(err => {
        const errorMsg = err?.message || 'Failed to load entity audit logs';
        this.error$.set(errorMsg);
        this.loading$.set(false);
        console.error('[AuditLogService] getAuditLogsByEntity error', err);
        return throwError(() => err);
      })
    );
  }

  private buildParams(filter: Partial<AuditLogFilter>): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    if (filter.page !== undefined) params['page'] = filter.page;
    if (filter.limit !== undefined) params['limit'] = filter.limit;
    if (filter.userId) params['userId'] = filter.userId;
    if (filter.entityType) params['entityType'] = filter.entityType;
    if (filter.action) params['action'] = filter.action;
    if (filter.from) params['from'] = filter.from;
    if (filter.to) params['to'] = filter.to;
    if (filter.search) params['search'] = filter.search;
    return params;
  }
}
