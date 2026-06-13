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
import { RolesService } from '../../admin/services/roles.service';
import { Role } from '../../../shared/models/role.model';

@Component({
  selector: 'app-roles',
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
        <h1 class="text-3xl font-bold text-primary">{{ 'sidebar.roles' | t }}</h1>
        <button
          (click)="onCreateRole()"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm whitespace-nowrap"
        >
          + Nuevo Rol
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
      @if (rolesService.loading$()) {
        <app-skeleton type="table"></app-skeleton>
      } @else {
        @if ((rolesService.roles$() ?? []).length > 0) {
          <!-- Table -->
          <app-table
            [columns]="columns"
            [data]="filteredRoles"
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
            [total]="filteredRoles.length"
            [pageSize]="pageSize"
            (pageChanged)="onPageChange($event)"
          ></app-pagination>
        } @else {
          <div class="bg-white rounded-lg shadow p-8 text-center">
            <p class="text-gray-500 font-medium">No hay roles que coincidan con los filtros</p>
          </div>
        }
      }

      <!-- Stats -->
      <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p class="text-secondary text-xs font-medium uppercase tracking-wide">Total Roles</p>
          <p class="text-3xl font-bold text-primary mt-2">{{ totalRolesCount }}</p>
        </div>
      </div>
    </div>
  `
})
export class RolesComponent implements OnInit, OnDestroy {
  currentPage = 1;
  pageSize = 10;
  globalSearch = '';
  hasActiveFilters = false;
  totalRolesCount = 0;
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
      confirmMessage: '¿Estás seguro de que deseas eliminar este rol?'
    }
  ];

  get filteredRoles(): Role[] {
    return this.rolesService.roles$().filter(role => this.matchesAllFilters(role));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRoles.length / this.pageSize);
  }

  constructor(
    public rolesService: RolesService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.rolesService.loadRoles().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast('Error al cargar roles', 'error');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateStats(): void {
    this.totalRolesCount = this.rolesService.roles$().length;
  }

  onCreateRole(): void {
    this.modalService
      .openConfirm(
        'Nuevo Rol',
        'Funcionalidad de crear roles próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          this.notificationService.success('Rol creado', 'El rol se creó correctamente');
        }
      });
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const role = event.row as unknown as Role;

    switch (event.action) {
      case 'view':
        this.viewRole(role);
        break;
      case 'edit':
        this.editRole(role);
        break;
      case 'delete':
        this.deleteRole(role);
        break;
    }
  }

  viewRole(role: Role): void {
    this.modalService
      .openConfirm(
        role.name,
        `Descripción: ${role.description ?? 'N/A'}\nCreado: ${role.createdAt}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  editRole(role: Role): void {
    this.modalService
      .openConfirm(
        `Editar: ${role.name}`,
        'Funcionalidad de edición próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  deleteRole(role: Role): void {
    this.modalService
      .openConfirm(
        'Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar el rol "${role.name}"?`,
        true
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          const roleId = (role._id ?? role.id) as string;
          this.rolesService.deleteRole(roleId).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.updateStats();
              this.notificationService.toast('Rol eliminado correctamente', 'success');
            },
            error: () => {
              this.notificationService.toast('Error al eliminar el rol', 'error');
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
    const sortedRoles = [...this.rolesService.roles$()].sort((a, b) => {
      const aVal = a[event.sortBy as keyof Role];
      const bVal = b[event.sortBy as keyof Role];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return event.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();

      return event.sortOrder === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    this.rolesService.roles$.set(sortedRoles);
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

  private matchesAllFilters(role: Role): boolean {
    if (
      this.globalSearch &&
      !role.name.toLowerCase().includes(this.globalSearch.toLowerCase())
    ) {
      return false;
    }

    for (const [column, filterValue] of Object.entries(this.columnFilters)) {
      const cellValue = String(role[column as keyof Role] || '').toLowerCase();
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
