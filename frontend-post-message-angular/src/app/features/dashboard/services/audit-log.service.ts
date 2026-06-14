import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { DASHBOARD_ENDPOINTS } from '../constants';
import { AuditLog, AuditAction, AuditEntityType, ApiResponse, PaginatedResponse } from '../types';

export interface AuditLogFilter {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  search?: string;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  constructor(private http: HttpClient) {}

  getAllAuditLogs(filter: AuditLogFilter = {}): Observable<PaginatedResponse<AuditLog>> {
    const params: Record<string, string | number> = {};
    if (filter.page !== undefined) params['page'] = filter.page;
    if (filter.limit !== undefined) params['limit'] = filter.limit;
    if (filter.action) params['action'] = filter.action;
    if (filter.entityType) params['entityType'] = filter.entityType;
    if (filter.search) params['search'] = filter.search;
    if (filter.from) params['from'] = filter.from;
    if (filter.to) params['to'] = filter.to;

    return this.http
      .get<PaginatedResponse<AuditLog>>(DASHBOARD_ENDPOINTS.AUDIT_LOGS.GET_ALL, { params })
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching audit logs:', error);
          return throwError(() => error);
        })
      );
  }

  getAuditLogById(id: string): Observable<ApiResponse<AuditLog>> {
    return this.http
      .get<ApiResponse<AuditLog>>(DASHBOARD_ENDPOINTS.AUDIT_LOGS.GET_BY_ID(id))
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error fetching audit log:', error);
          return throwError(() => error);
        })
      );
  }
}
