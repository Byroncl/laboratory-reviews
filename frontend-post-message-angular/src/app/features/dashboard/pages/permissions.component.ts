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
  BadgeComponent,
  SpinnerComponent,
  SkeletonComponent
} from '../../../shared/components/index';
import { ModalService, NotificationService } from '../../../shared/services/index';
import { PermissionsService } from '../../admin/services/permissions.service';
import { Permission } from '../../../shared/models/permission.model';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 class="text-3xl font-bold text-primary">{{ 'sidebar.permissions' | t }}</h1>
        <button
          (click)="onCreatePermission()"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm whitespace-nowrap"
        >
          + Nuevo Permiso
        </button>
      </div>

      <!-- Search -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          [(ngModel)]="globalSearch"
          (input)="onGlobalSearch()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />
        @if (hasActiveFilters) {
          <button
            (click)="clearAllFilters()"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
          >
            Limpiar filtros
          </button>
        }
      </div>

      <!-- Loading State -->
      @if (permissionsService.loading$()) {
        <app-skeleton type="table"></app-skeleton>
      } @else {
        @if ((permissionsService.permissions$() ?? []).length > 0) {
          <!-- Table -->
          <app-table
            [columns]="columns"
            [data]="filteredPermissions"
            [actions]="actions"
            [primaryColumnKey]="'name'"
            (actionTriggered)="onTableAction($event)"
            (sorted)="onSort($event)"
            (filtered)="onColumnFilter($event)"
          ></app-table>

          <!-- Pagination -->
          <app-pagination
            [currentPage]="currentPage"
            [totalPages]="totalPages"
            [total]="filteredPermissions.length"
            [pageSize]="pageSize"
            (pageChanged)="onPageChange($event)"
          ></app-pagination>
        } @else {
          <div class="bg-white rounded-lg shadow p-8 text-center">
            <p class="text-gray-500 font-medium">No hay permisos que coincidan con los filtros</p>
          </div>
        }
      }

      <!-- Stats -->
      <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p class="text-secondary text-xs font-medium uppercase tracking-wide">Total Permisos</p>
          <p class="text-3xl font-bold text-primary mt-2">{{ totalPermissionsCount }}</p>
        </div>
      </div>
    </div>
  `
})
export class PermissionsComponent implements OnInit, OnDestroy {
  currentPage = 1;
  pageSize = 10;
  globalSearch = '';
  hasActiveFilters = false;
  totalPermissionsCount = 0;
  private columnFilters: Record<string, string> = {};
  private destroy$ = new Subject<void>();

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, filterable: true },
    { key: 'description', label: 'Descripción', sortable: true, filterable: true },
    { key: 'createdAt', label: 'Creado', sortable: true }
  ];

  actions: TableAction[] = [
    { id: 'view', label: 'Ver', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
    { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'delete',
      class: 'text-red-600 hover:text-red-700',
      confirm: true,
      confirmMessage: '¿Estás seguro de que deseas eliminar este permiso?'
    }
  ];

  get filteredPermissions(): Permission[] {
    return this.permissionsService.permissions$().filter(permission => this.matchesAllFilters(permission));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPermissions.length / this.pageSize);
  }

  constructor(
    public permissionsService: PermissionsService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.permissionsService.loadPermissions().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast('Error al cargar permisos', 'error');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateStats(): void {
    this.totalPermissionsCount = this.permissionsService.permissions$().length;
  }

  onCreatePermission(): void {
    this.modalService
      .openConfirm(
        'Nuevo Permiso',
        'Funcionalidad de crear permisos próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          this.notificationService.success('Permiso creado', 'El permiso se creó correctamente');
        }
      });
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const permission = event.row as unknown as Permission;

    switch (event.action) {
      case 'view':
        this.viewPermission(permission);
        break;
      case 'edit':
        this.editPermission(permission);
        break;
      case 'delete':
        this.deletePermission(permission);
        break;
    }
  }

  viewPermission(permission: Permission): void {
    this.modalService
      .openConfirm(
        permission.name,
        `Descripción: ${permission.description ?? 'N/A'}\nCreado: ${permission.createdAt}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  editPermission(permission: Permission): void {
    this.modalService
      .openConfirm(
        `Editar: ${permission.name}`,
        'Funcionalidad de edición próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  deletePermission(permission: Permission): void {
    this.modalService
      .openConfirm(
        'Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar el permiso "${permission.name}"?`,
        true
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          const permissionId = (permission._id ?? permission.id) as string;
          this.permissionsService.deletePermission(permissionId).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.updateStats();
              this.notificationService.toast('Permiso eliminado correctamente', 'success');
            },
            error: () => {
              this.notificationService.toast('Error al eliminar el permiso', 'error');
            }
          });
        }
      });
  }

  onGlobalSearch(): void {
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  onColumnFilter(filters: Array<{ column: string; value: string }>): void {
    this.columnFilters = {};
    filters.forEach(filter => {
      this.columnFilters[filter.column] = filter.value;
    });
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    const sortedPermissions = [...this.permissionsService.permissions$()].sort((a, b) => {
      const aVal = a[event.sortBy as keyof Permission];
      const bVal = b[event.sortBy as keyof Permission];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return event.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();

      return event.sortOrder === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    this.permissionsService.permissions$.set(sortedPermissions);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  clearAllFilters(): void {
    this.globalSearch = '';
    this.columnFilters = {};
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  private matchesAllFilters(permission: Permission): boolean {
    if (
      this.globalSearch &&
      !permission.name.toLowerCase().includes(this.globalSearch.toLowerCase())
    ) {
      return false;
    }

    for (const [column, filterValue] of Object.entries(this.columnFilters)) {
      const cellValue = String(permission[column as keyof Permission] || '').toLowerCase();
      if (!cellValue.includes(filterValue.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters =
      this.globalSearch !== '' ||
      Object.keys(this.columnFilters).length > 0;
  }
}
