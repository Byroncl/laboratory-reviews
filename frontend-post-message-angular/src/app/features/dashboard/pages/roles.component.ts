import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { NotificationService } from '../../../shared/services/index';
import { I18nService } from '../../../core/services/i18n.service';
import { RolesService } from '../../admin/services/roles.service';
import { Role } from '../../../shared/models/role.model';
import { RolePermissionsComponent } from '../components/role-permissions/role-permissions.component';
import {
  extractId,
  filterRoles,
  sortByField,
  applyColumnFilters
} from '../../admin';

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
    SkeletonComponent,
    RolePermissionsComponent
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {
  private destroyRef = inject(DestroyRef);
  readonly rolesService = inject(RolesService);
  private notificationService = inject(NotificationService);
  private i18n = inject(I18nService);

  readonly pageSize = 10;

  // Modal states
  readonly showCreateModal = signal(false);
  readonly showViewModal = signal(false);
  readonly showPermissionsModal = signal(false);
  readonly selectedRole = signal<Role | null>(null);
  readonly isSavingRole = signal(false);

  // Search & filters
  readonly globalSearch = signal('');
  readonly hasActiveFilters = signal(false);

  // Stats
  readonly totalRolesCount = signal(0);

  // Private filter/sort state
  private readonly columnFilters$ = signal<Record<string, string>>({});
  private readonly sortState$ = signal<{ sortBy?: string; sortOrder: 'asc' | 'desc' }>({
    sortOrder: 'asc'
  });

  // Computed filtered roles
  readonly filteredRoles = computed(() => {
    const roles = this.rolesService.roles$();
    const filters = { searchTerm: this.globalSearch$() };

    let filtered = filterRoles(roles, filters);
    filtered = applyColumnFilters(filtered, this.columnFilters$());

    if (this.sortState$().sortBy) {
      filtered = sortByField(
        filtered,
        this.sortState$().sortBy as keyof Role,
        this.sortState$().sortOrder
      );
    }

    return filtered;
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredRoles().length / this.pageSize)
  );

  readonly currentPage$ = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, filterable: true },
    { key: 'identifier', label: 'Identificador', sortable: true, filterable: true },
    { key: 'isActive', label: 'Activo', sortable: true },
    { key: 'createdAt', label: 'Creado', sortable: true }
  ];

  readonly actions: TableAction[] = [
    { id: 'view', label: 'Ver', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
    { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
    { id: 'assign', label: 'Permisos', icon: 'permissions', class: 'text-purple-600 hover:text-purple-700' },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'delete',
      class: 'text-red-600 hover:text-red-700',
      confirm: true,
      confirmMessage: '¿Estás seguro?'
    }
  ];

  constructor() {
    this.loadRoles();
  }

  openCreateModal(): void {
    this.selectedRole.set(null);
    this.showCreateModal.set(true);
  }

  openViewModal(role: Role): void {
    this.selectedRole.set(role);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedRole.set(null);
  }

  editRole(role: Role): void {
    this.selectedRole.set(role);
    this.showViewModal.set(false);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.selectedRole.set(null);
  }

  openPermissionsModal(role: Role): void {
    this.selectedRole.set(role);
    this.showPermissionsModal.set(true);
  }

  closePermissionsModal(): void {
    this.showPermissionsModal.set(false);
    this.selectedRole.set(null);
  }

  saveRole(): void {
    this.isSavingRole.set(true);
    // Refresh after save
    setTimeout(() => {
      this.isSavingRole.set(false);
      this.closeCreateModal();
      this.loadRoles();
    }, 500);
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const role = event.row as unknown as Role;

    switch (event.action) {
      case 'view':
        this.openViewModal(role);
        break;
      case 'edit':
        this.editRole(role);
        break;
      case 'assign':
        this.openPermissionsModal(role);
        break;
      case 'delete':
        this.deleteRole(role);
        break;
    }
  }

  deleteRole(role: Role): void {
    const roleId = extractId(role);
    this.rolesService.deleteRole(roleId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificationService.toast('✅ Rol eliminado correctamente', 'success');
        this.loadRoles();
      },
      error: () => {
        this.notificationService.toast('❌ Error al eliminar', 'error');
      }
    });
  }

  onGlobalSearch(): void {
    this.currentPage$.set(1);
    this.updateActiveFilters();
    this.loadRoles();
  }

  onColumnFilter(filters: Array<{ column: string; value: string }>): void {
    const filterMap: Record<string, string> = {};
    filters.forEach(f => {
      filterMap[f.column] = f.value;
    });
    this.columnFilters$.set(filterMap);
    this.currentPage$.set(1);
    this.updateActiveFilters();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    this.sortState$.set({ sortBy: event.sortBy, sortOrder: event.sortOrder });
  }

  onPageChange(page: number): void {
    this.currentPage$.set(page);
  }

  clearAllFilters(): void {
    this.globalSearch.set('');
    this.columnFilters$.set({});
    this.currentPage$.set(1);
    this.updateActiveFilters();
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesService
      .loadRoles(0, 10, this.globalSearch() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.updateStats(),
        error: () => this.notificationService.toast('❌ Error cargando roles', 'error')
      });
  }

  private updateStats(): void {
    this.totalRolesCount.set(this.rolesService.roles$().length);
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters$.set(
      this.globalSearch$() !== '' ||
        Object.keys(this.columnFilters$()).length > 0
    );
  }
}
