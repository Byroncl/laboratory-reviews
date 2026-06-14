import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import {
  TableComponent,
  TableColumn,
  TableAction,
  PaginationComponent,
  SkeletonComponent
} from '../../../shared/components/index';
import { NotificationService } from '../../../shared/services/index';
import { I18nService } from '../../../core/services/i18n.service';
import { AuditLogService } from '../../admin/services/audit-log.service';
import { AuditLog, AuditLogFilter, AuditAction, EntityType } from '../../../shared/models/audit-log.model';
import { sortByField } from '../../admin';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    SkeletonComponent
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export class AuditLogsComponent {
  // State signals
  readonly filter$ = signal<AuditLogFilter>({ page: 1, limit: 20 });
  readonly fromDate$ = signal('');
  readonly toDate$ = signal('');
  readonly selectedEntry$ = signal<AuditLog | null>(null);

  // Computed derived state
  readonly hasActiveFilters = computed(() => {
    const f = this.filter$();
    return !!(f.search || f.action || f.entityType || f.from || f.to);
  });

  readonly tableData = computed<Record<string, unknown>[]>(() =>
    this.auditLogService.auditLogs$().map(entry => ({
      ...entry,
      createdAt: this.formatDate(entry.createdAt)
    }))
  );

  readonly auditActions: readonly AuditAction[] = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ASSIGN', 'ACTIVATE', 'DEACTIVATE'
  ];

  readonly entityTypes: readonly EntityType[] = [
    'user', 'role', 'permission', 'post', 'comment', 'category', 'file', 'client'
  ];

  readonly columns: TableColumn[] = [
    { key: 'createdAt', label: 'Timestamp', sortable: true },
    { key: 'username', label: 'User', sortable: true, filterable: true },
    { key: 'action', label: 'Action', sortable: true, filterable: true },
    { key: 'entityType', label: 'Entity Type', sortable: true, filterable: true },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'httpMethod', label: 'Method' },
    { key: 'path', label: 'Path' },
    { key: 'statusCode', label: 'Status', sortable: true }
  ];

  readonly actions: TableAction[] = [
    { id: 'view', label: 'View details', icon: 'view', class: 'text-blue-600 hover:text-blue-700' }
  ];

  constructor(
    readonly auditLogService: AuditLogService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {
    this.load();
  }

  onFilterChange(patch: Partial<AuditLogFilter>): void {
    this.filter$.set({ ...this.filter$(), ...patch, page: 1 });
    this.load();
  }

  onActionFilterChange(action: AuditAction | undefined): void {
    this.onFilterChange({ action });
  }

  onEntityTypeFilterChange(entityType: EntityType | undefined): void {
    this.onFilterChange({ entityType });
  }

  onSearchChange(search: string): void {
    this.onFilterChange({ search });
  }

  onDateRangeChange(): void {
    const from = this.fromDate$() ? new Date(this.fromDate$()).toISOString() : undefined;
    const to = this.toDate$() ? new Date(this.toDate$()).toISOString() : undefined;
    this.filter$.set({ ...this.filter$(), page: 1, from, to });
    this.load();
  }

  clearFilters(): void {
    this.filter$.set({ page: 1, limit: 20 });
    this.fromDate$.set('');
    this.toDate$.set('');
    this.load();
  }

  onPageChange(page: number): void {
    this.filter$.set({ ...this.filter$(), page });
    this.load();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    const sorted = sortByField(
      this.auditLogService.auditLogs$(),
      event.sortBy as keyof AuditLog,
      event.sortOrder
    );
    this.auditLogService.auditLogs$.set(sorted);
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'view') {
      const entry = this.auditLogService
        .auditLogs$()
        .find(e => e._id === (event.row as unknown as AuditLog)._id) ?? null;
      this.selectedEntry$.set(entry);
    }
  }

  closeDetail(): void {
    this.selectedEntry$.set(null);
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  }

  getActionClass(action: AuditAction): Record<string, boolean> {
    const map: Record<AuditAction, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      ASSIGN: 'bg-yellow-100 text-yellow-800',
      ACTIVATE: 'bg-teal-100 text-teal-800',
      DEACTIVATE: 'bg-orange-100 text-orange-800'
    };
    const classes = map[action] ?? 'bg-gray-100 text-gray-800';
    return classes.split(' ').reduce((acc, cls) => ({ ...acc, [cls]: true }), {});
  }

  hasKeys(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length > 0;
  }

  private load(): void {
    this.auditLogService
      .getAuditLogs(this.filter$())
      .pipe(takeUntilDestroyed())
      .subscribe({
        error: () => this.notificationService.toast(this.i18n.translate('dashboard.auditLogs.loadError'), 'error')
      });
  }
}
