import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  AuditLog,
  AuditLogFilter,
  AuditLogPage,
  EntityType
} from '../../../shared/models/audit-log.model';
import { ADMIN_ENDPOINTS } from '../constants';

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

  private retryAttempts = 2;

  constructor(private api: ApiService) {}

  getAuditLogs(filter: AuditLogFilter): Observable<AuditLogPage> {
    this.loading$.set(true);
    this.error$.set(null);

    const params = this._buildParams(filter);

    return this.api.get<AuditLogPage>(ADMIN_ENDPOINTS.AUDIT_LOGS, params).pipe(
      retry(this.retryAttempts),
      tap(response => this._handleLoadSuccess(response)),
      catchError(err => this._handleError(err, 'Failed to load audit logs'))
    );
  }

  getAuditLogById(id: string): Observable<AuditLog> {
    return this.api.get<AuditLog>(`${ADMIN_ENDPOINTS.AUDIT_LOGS}/${id}`).pipe(
      retry(this.retryAttempts),
      catchError(err => this._handleError(err, 'Failed to load audit log'))
    );
  }

  getAuditLogsByEntity(
    entityType: EntityType,
    entityId: string,
    filter?: Partial<AuditLogFilter>
  ): Observable<AuditLogPage> {
    this.loading$.set(true);
    this.error$.set(null);

    const params = this._buildParams({
      page: 1,
      limit: 20,
      ...filter
    });

    return this.api.get<AuditLogPage>(
      `${ADMIN_ENDPOINTS.AUDIT_LOGS}/entity/${entityType}/${entityId}`,
      params
    ).pipe(
      retry(this.retryAttempts),
      tap(response => this._handleLoadSuccess(response)),
      catchError(err => this._handleError(err, 'Failed to load entity audit logs'))
    );
  }

  private _handleLoadSuccess(response: AuditLogPage): void {
    this.auditLogs$.set(response.data ?? []);
    this.pagination.set({
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages
    });
    this.loading$.set(false);
  }

  private _handleError(err: any, defaultMessage: string): Observable<never> {
    const errorMsg = err?.message || defaultMessage;
    this.error$.set(errorMsg);
    this.loading$.set(false);
    return throwError(() => err);
  }

  private _buildParams(filter: Partial<AuditLogFilter>): Record<string, unknown> {
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
