import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  template?: boolean;
  hidden?: boolean;
}

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  class?: string;
  confirm?: boolean;
  confirmMessage?: string;
}

export interface FilterEvent {
  column: string;
  value: string;
}

export interface SortEvent {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-4">
      <!-- Desktop View -->
      <div class="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <!-- Header -->
          <thead class="bg-gray-50 border-b border-gray-200">
            <!-- Column Headers Row -->
            <tr>
              @for (column of visibleColumns; track column.key) {
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  [style.width]="column.width"
                  (click)="onSort(column)"
                >
                  <div class="flex items-center gap-2">
                    <span>{{ column.label }}</span>
                    @if (column.sortable && sortBy === column.key) {
                      <svg
                        class="w-4 h-4 transition-transform"
                        [class.rotate-180]="sortOrder === 'desc'"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m-4 4l-4-4"
                        ></path>
                      </svg>
                    }
                  </div>
                </th>
              }
              @if (actions.length > 0) {
                <th class="px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                  Acciones
                </th>
              }
            </tr>

            <!-- Filter Row -->
            @if (hasFilterableColumns) {
              <tr class="bg-white border-t border-gray-200">
                @for (column of visibleColumns; track column.key) {
                  <td class="px-6 py-3">
                    @if (column.filterable) {
                      <input
                        type="text"
                        [placeholder]="'Filtrar ' + column.label"
                        [value]="filters[column.key] || ''"
                        (input)="onFilterChange(column.key, $event)"
                        class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      />
                    }
                  </td>
                }
                @if (actions.length > 0) {
                  <td class="px-6 py-3"></td>
                }
              </tr>
            }
          </thead>

          <!-- Body -->
          <tbody class="bg-white divide-y divide-gray-200">
            @if (data.length === 0) {
              <tr>
                <td
                  [attr.colspan]="visibleColumns.length + (actions.length > 0 ? 1 : 0)"
                  class="px-6 py-8 text-center"
                >
                  <p class="text-secondary text-sm font-medium">No hay datos disponibles</p>
                </td>
              </tr>
            } @else {
              @for (row of data; track row['id']; let i = $index) {
                <tr class="hover:bg-gray-50 transition">
                  @for (column of visibleColumns; track column.key) {
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getCellValue(row, column.key) }}
                    </td>
                  }
                  @if (actions.length > 0) {
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-2">
                        @for (action of actions; track action.id) {
                          <button
                            type="button"
                            (click)="onAction(action.id, row, action)"
                            [class]="action.class || 'text-primary hover:text-primary/80'"
                            class="transition-colors p-1.5 rounded hover:bg-gray-100"
                            [title]="action.label"
                            [attr.aria-label]="action.label"
                          >
                            <svg class="w-4 h-4" [innerHTML]="getActionIcon(action.icon)" [attr.aria-hidden]="true"></svg>
                          </button>
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4">
        @if (data.length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-secondary text-sm font-medium">No hay datos disponibles</p>
          </div>
        } @else {
          @for (row of data; track row['id']) {
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <!-- Card Header -->
              <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 class="font-semibold text-primary truncate">
                  {{ getCellValue(row, primaryColumnKey) }}
                </h3>
              </div>

              <!-- Card Body -->
              <div class="px-4 py-3 space-y-2">
                @for (column of visibleColumns; track column.key) {
                  @if (column.key !== primaryColumnKey) {
                    <div class="flex justify-between items-start">
                      <span class="text-xs font-medium text-secondary uppercase">{{ column.label }}</span>
                      <span class="text-sm text-gray-900 text-right">
                        {{ getCellValue(row, column.key) }}
                      </span>
                    </div>
                  }
                }
              </div>

              <!-- Card Footer (Actions) -->
              @if (actions.length > 0) {
                <div class="px-4 py-3 border-t border-gray-200 flex gap-2">
                  @for (action of actions; track action.id) {
                    <button
                      type="button"
                      (click)="onAction(action.id, row, action)"
                      [class]="action.class || 'text-primary'"
                      class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2"
                    >
                      <svg class="w-4 h-4" [innerHTML]="getActionIcon(action.icon)" [attr.aria-hidden]="true"></svg>
                      <span>{{ action.label }}</span>
                    </button>
                  }
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    input[type="text"] {
      &::placeholder {
        color: #d1d5db;
      }
    }
  `]
})
export class TableComponent implements OnInit, OnDestroy {
  @Input() columns: TableColumn[] = [];
  @Input() data: Record<string, unknown>[] = [];
  @Input() actions: TableAction[] = [];
  @Input() primaryColumnKey = 'id';

  @Output() actionTriggered = new EventEmitter<{
    action: string;
    row: Record<string, unknown>;
  }>();
  @Output() sorted = new EventEmitter<SortEvent>();
  @Output() filtered = new EventEmitter<FilterEvent[]>();

  sortBy: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  filters: Record<string, string> = {};
  visibleColumns: TableColumn[] = [];
  hasFilterableColumns = false;

  private filterSubject = new Subject<FilterEvent[]>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateVisibleColumns();
    this.setFilterableColumns();

    this.filterSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(filters => {
        this.filtered.emit(filters);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateVisibleColumns(): void {
    this.visibleColumns = this.columns.filter(col => !col.hidden);
  }

  private setFilterableColumns(): void {
    this.hasFilterableColumns = this.columns.some(col => col.filterable);
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortBy === column.key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column.key;
      this.sortOrder = 'asc';
    }

    this.sorted.emit({ sortBy: this.sortBy, sortOrder: this.sortOrder });
  }

  onFilterChange(columnKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value) {
      this.filters[columnKey] = value;
    } else {
      delete this.filters[columnKey];
    }

    const filterArray = Object.entries(this.filters).map(([column, value]) => ({
      column,
      value
    }));

    this.filterSubject.next(filterArray);
  }

  onAction(
    actionId: string,
    row: Record<string, unknown>,
    action: TableAction
  ): void {
    if (action.confirm && action.confirmMessage) {
      if (confirm(action.confirmMessage)) {
        this.actionTriggered.emit({ action: actionId, row });
      }
    } else {
      this.actionTriggered.emit({ action: actionId, row });
    }
  }

  getCellValue(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    return String(value || '');
  }


  getActionIcon(iconName: string): string {
    const icons: Record<string, string> = {
      edit: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>',
      delete: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>',
      view: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>',
      more: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>'
    };
    return icons[iconName] || '';
  }
}
