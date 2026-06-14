import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import {
  TableComponent,
  TableColumn,
  TableAction,
  PaginationComponent,
  SkeletonComponent
} from '../../../shared/components/index';
import { NotificationService } from '../../../shared/services/index';
import { AuditLogService } from '../../admin/services/audit-log.service';
import { AuditLog, AuditLogFilter, AuditAction, EntityType } from '../../../shared/models/audit-log.model';

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
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 class="text-3xl font-bold text-primary">Audit Logs</h1>
        <span class="text-sm text-gray-500">
          {{ auditLogService.pagination().total }} total entries
        </span>
      </div>

      <!-- Filter Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-lg shadow p-4">
        <!-- Search -->
        <input
          type="text"
          placeholder="Search user or path..."
          [(ngModel)]="filter.search"
          (input)="onFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />

        <!-- Action filter -->
        <select
          [(ngModel)]="filter.action"
          (change)="onFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
        >
          <option [ngValue]="undefined">All actions</option>
          @for (action of auditActions; track action) {
            <option [value]="action">{{ action }}</option>
          }
        </select>

        <!-- Entity type filter -->
        <select
          [(ngModel)]="filter.entityType"
          (change)="onFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
        >
          <option [ngValue]="undefined">All entity types</option>
          @for (et of entityTypes; track et) {
            <option [value]="et">{{ et }}</option>
          }
        </select>

        <!-- Clear filters -->
        @if (hasActiveFilters) {
          <button
            (click)="clearFilters()"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
          >
            Clear filters
          </button>
        }
      </div>

      <!-- Date range row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 whitespace-nowrap">From:</label>
          <input
            type="datetime-local"
            [(ngModel)]="fromDate"
            (change)="onDateRangeChange()"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 whitespace-nowrap">To:</label>
          <input
            type="datetime-local"
            [(ngModel)]="toDate"
            (change)="onDateRangeChange()"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
          />
        </div>
      </div>

      <!-- Loading State -->
      @if (auditLogService.loading$()) {
        <app-skeleton type="table"></app-skeleton>
      } @else {
        @if (auditLogService.auditLogs$().length > 0) {
          <!-- Table -->
          <app-table
            [columns]="columns"
            [data]="tableData"
            [actions]="actions"
            [primaryColumnKey]="'username'"
            (actionTriggered)="onTableAction($event)"
            (sorted)="onSort($event)"
          ></app-table>

          <!-- Pagination -->
          <app-pagination
            [currentPage]="filter.page"
            [totalPages]="auditLogService.totalPages()"
            [total]="auditLogService.pagination().total"
            [pageSize]="filter.limit"
            (pageChanged)="onPageChange($event)"
          ></app-pagination>
        } @else {
          <div class="bg-white rounded-lg shadow p-8 text-center">
            <p class="text-gray-500 font-medium">No audit log entries match the current filters</p>
          </div>
        }
      }

      <!-- Detail Modal -->
      @if (selectedEntry) {
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          (click)="closeDetail()"
        >
          <div
            class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal header -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Audit Log Detail</h2>
                <p class="text-sm text-gray-500 mt-1">{{ selectedEntry._id }}</p>
              </div>
              <button
                (click)="closeDetail()"
                class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <!-- Modal body -->
            <div class="p-6 space-y-6">
              <!-- Core fields -->
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500 block">Timestamp</span>
                  <span class="font-medium">{{ formatDate(selectedEntry.createdAt) }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block">User</span>
                  <span class="font-medium">{{ selectedEntry.username }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block">Action</span>
                  <span
                    class="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="getActionClass(selectedEntry.action)"
                  >
                    {{ selectedEntry.action }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 block">Status</span>
                  <span
                    class="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="selectedEntry.statusCode < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ selectedEntry.statusCode }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 block">Entity Type</span>
                  <span class="font-medium">{{ selectedEntry.entityType }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block">Entity ID</span>
                  <span class="font-medium font-mono text-xs">{{ selectedEntry.entityId || '—' }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block">Method</span>
                  <span class="font-medium">{{ selectedEntry.httpMethod }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block">Path</span>
                  <span class="font-medium font-mono text-xs break-all">{{ selectedEntry.path }}</span>
                </div>
                <div>
                  <span class="text-gray-500 block">IP</span>
                  <span class="font-medium font-mono text-xs">{{ selectedEntry.ip }}</span>
                </div>
              </div>

              <!-- Before snapshot -->
              @if (selectedEntry.before) {
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-2">Before</h3>
                  <pre class="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-gray-200">{{ selectedEntry.before | json }}</pre>
                </div>
              }

              <!-- After snapshot -->
              @if (selectedEntry.after) {
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-2">After</h3>
                  <pre class="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-gray-200">{{ selectedEntry.after | json }}</pre>
                </div>
              }

              <!-- Metadata -->
              @if (selectedEntry.metadata && hasKeys(selectedEntry.metadata)) {
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-2">Metadata</h3>
                  <pre class="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-gray-200">{{ selectedEntry.metadata | json }}</pre>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AuditLogsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filter: AuditLogFilter = { page: 1, limit: 20 };
  fromDate = '';
  toDate = '';
  selectedEntry: AuditLog | null = null;

  readonly auditActions: AuditAction[] = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ASSIGN', 'ACTIVATE', 'DEACTIVATE'
  ];

  readonly entityTypes: EntityType[] = [
    'user', 'role', 'permission', 'post', 'comment', 'category', 'file', 'client'
  ];

  columns: TableColumn[] = [
    { key: 'createdAt', label: 'Timestamp', sortable: true },
    { key: 'username', label: 'User', sortable: true, filterable: true },
    { key: 'action', label: 'Action', sortable: true, filterable: true },
    { key: 'entityType', label: 'Entity Type', sortable: true, filterable: true },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'httpMethod', label: 'Method' },
    { key: 'path', label: 'Path' },
    { key: 'statusCode', label: 'Status', sortable: true }
  ];

  actions: TableAction[] = [
    { id: 'view', label: 'View details', icon: 'view', class: 'text-blue-600 hover:text-blue-700' }
  ];

  get tableData(): Record<string, unknown>[] {
    return this.auditLogService.auditLogs$().map(entry => ({
      ...entry,
      createdAt: this.formatDate(entry.createdAt)
    }));
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.filter.search ||
      this.filter.action ||
      this.filter.entityType ||
      this.filter.from ||
      this.filter.to
    );
  }

  constructor(
    public auditLogService: AuditLogService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    this.auditLogService
      .getAuditLogs(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => {
          this.notificationService.toast('Error loading audit logs', 'error');
        }
      });
  }

  onFilterChange(): void {
    this.filter = { ...this.filter, page: 1 };
    this.load();
  }

  onDateRangeChange(): void {
    this.filter = {
      ...this.filter,
      page: 1,
      from: this.fromDate ? new Date(this.fromDate).toISOString() : undefined,
      to: this.toDate ? new Date(this.toDate).toISOString() : undefined
    };
    this.load();
  }

  clearFilters(): void {
    this.filter = { page: 1, limit: 20 };
    this.fromDate = '';
    this.toDate = '';
    this.load();
  }

  onPageChange(page: number): void {
    this.filter = { ...this.filter, page };
    this.load();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    const sorted = [...this.auditLogService.auditLogs$()].sort((a, b) => {
      const aVal = String(a[event.sortBy as keyof AuditLog] ?? '');
      const bVal = String(b[event.sortBy as keyof AuditLog] ?? '');
      return event.sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    this.auditLogService.auditLogs$.set(sorted);
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'view') {
      const entry = this.auditLogService
        .auditLogs$()
        .find(e => e._id === (event.row as unknown as AuditLog)._id) ?? null;
      this.selectedEntry = entry;
    }
  }

  closeDetail(): void {
    this.selectedEntry = null;
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
}
