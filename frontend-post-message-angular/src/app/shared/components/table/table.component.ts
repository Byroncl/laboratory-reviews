import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  template?: boolean;
}

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  class?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Header -->
        <thead class="bg-gray-50">
          <tr>
            @for (column of columns; track column.key) {
              <th
                class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                [style.width]="column.width"
                (click)="onSort(column)"
              >
                <div class="flex items-center gap-2">
                  <span>{{ column.label }}</span>
                  @if (column.sortable && sortBy === column.key) {
                    <svg class="w-4 h-4" [class.rotate-180]="sortOrder === 'desc'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m-4 4l-4-4"></path>
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
        </thead>

        <!-- Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          @if (data.length === 0) {
            <tr>
              <td [attr.colspan]="columns.length + (actions.length > 0 ? 1 : 0)" class="px-6 py-8 text-center">
                <p class="text-secondary text-sm">No hay datos disponibles</p>
              </td>
            </tr>
          } @else {
            @for (row of data; track row['id']; let i = $index) {
              <tr class="hover:bg-gray-50 transition">
                @for (column of columns; track column.key) {
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getCellValue(row, column.key) }}
                  </td>
                }
                @if (actions.length > 0) {
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-2">
                      @for (action of actions; track action.id) {
                        <button
                          (click)="onAction(action.id, row)"
                          [class]="action.class || 'text-primary hover:text-primary/80'"
                          class="transition"
                          [title]="action.label"
                        >
                          <svg class="w-4 h-4" [innerHTML]="getActionIcon(action.icon)"></svg>
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
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: Record<string, unknown>[] = [];
  @Input() actions: TableAction[] = [];
  @Output() actionTriggered = new EventEmitter<{ action: string; row: Record<string, unknown> }>();
  @Output() sorted = new EventEmitter<{ sortBy: string; sortOrder: 'asc' | 'desc' }>();

  sortBy: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';

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

  onAction(actionId: string, row: Record<string, unknown>): void {
    this.actionTriggered.emit({ action: actionId, row });
  }

  getCellValue(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    return String(value || '');
  }

  getActionIcon(iconName: string): string {
    const icons: Record<string, string> = {
      edit: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>',
      delete: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>',
      view: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>'
    };
    return icons[iconName] || '';
  }
}
