import { Component, signal, computed } from '@angular/core';
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
import { ModalService, NotificationService } from '../../../shared/services/index';
import { RolesService } from '../../admin/services/roles.service';
import { Role } from '../../../shared/models/role.model';
import { RoleFormComponent } from '../components/role-form.component';
import { RolePermissionsComponent } from '../components/role-permissions.component';
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
    FormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent,
    RoleFormComponent,
    RolePermissionsComponent
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {
  readonly pageSize = 10;

  // State signals
  readonly showRoleForm$ = signal(false);
  readonly editingRoleId$ = signal<string | null>(null);
  readonly assigningRole$ = signal<Role | null>(null);
  readonly globalSearch$ = signal('');
  readonly hasActiveFilters$ = signal(false);

  // Stats signals
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
      confirmMessage: '¿Estás seguro de que deseas eliminar este rol?'
    }
  ];

  readonly currentPage$ = signal(1);

  constructor(
    readonly rolesService: RolesService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {
    this.loadRoles();
  }

  onCreateRole(): void {
    this.showRoleForm$.set(true);
    this.editingRoleId$.set(null);
    this.assigningRole$.set(null);
  }

  closeForm(): void {
    this.showRoleForm$.set(false);
    this.editingRoleId$.set(null);
  }

  closePermissionsPanel(): void {
    this.assigningRole$.set(null);
  }

  onFormSubmitted(): void {
    this.closeForm();
    this.updateStats();
  }

  onPermissionsSaved(): void {
    this.closePermissionsPanel();
    this.loadRoles();
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
      case 'assign':
        this.assignPermissions(role);
        break;
      case 'delete':
        this.deleteRole(role);
        break;
    }
  }

  viewRole(role: Role): void {
    const permCount = Array.isArray(role.permissions) ? role.permissions.length : 0;
    this.modalService
      .openConfirm(
        role.name,
        `Identificador: ${role.identifier ?? 'N/A'}\nPermisos asignados: ${permCount}\nActivo: ${role.isActive ? 'Si' : 'No'}\nCreado: ${role.createdAt}`
      )
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  editRole(role: Role): void {
    this.editingRoleId$.set(extractId(role));
    this.showRoleForm$.set(true);
    this.assigningRole$.set(null);
  }

  assignPermissions(role: Role): void {
    this.assigningRole$.set(role);
    this.showRoleForm$.set(false);
    this.editingRoleId$.set(null);
  }

  deleteRole(role: Role): void {
    this.modalService
      .openConfirm(
        'Confirmar eliminacion',
        `Esta seguro de que desea eliminar el rol "${role.name}"?`,
        true
      )
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        if (result.confirmed) {
          const roleId = extractId(role);
          this.rolesService.deleteRole(roleId).pipe(takeUntilDestroyed()).subscribe({
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
    this.globalSearch$.set('');
    this.columnFilters$.set({});
    this.currentPage$.set(1);
    this.updateActiveFilters();
    this.loadRoles();
  }

  private loadRoles(): void {
    this.rolesService
      .loadRoles(0, 10, this.globalSearch$() || undefined)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.updateStats(),
        error: () => this.notificationService.toast('Error al cargar roles', 'error')
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
