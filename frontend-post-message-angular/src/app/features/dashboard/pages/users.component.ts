import { Component, signal, computed, DestroyRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { I18nService } from '../../../core/services/i18n.service';
import { UsersService } from '../../admin/services/users.service';
import { RolesService } from '../../admin/services/roles.service';
import { User } from '../../../shared/models/user.model';
import { UserFormComponent } from '../components/user-form/user-form.component';
import {
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  extractId,
  filterUsers,
  sortByField,
  applyColumnFilters
} from '../../admin';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent,
    UserFormComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  readonly pageSize = 10;
  readonly statusFilterOptions = STATUS_FILTER_OPTIONS;
  private readonly rolesData = signal<any[]>([]);

  readonly roleFilterOptions = computed(() =>
    this.rolesData().map(role => ({ value: role.name, label: role.name }))
  );

  // Signals para estado
  readonly showUserForm$ = signal(false);
  readonly editingUserId$ = signal<string | null>(null);
  readonly globalSearch$ = signal('');
  readonly roleFilter$ = signal('');
  readonly statusFilter$ = signal('');
  readonly hasActiveFilters$ = signal(false);

  // Stats signals
  readonly totalUsersCount = signal(0);
  readonly activeCount = signal(0);
  readonly adminCount = signal(0);
  readonly suspendedCount = signal(0);

  // Filters state
  private columnFilters$ = signal<Record<string, string>>({});
  private sortState$ = signal<{ sortBy?: string; sortOrder: 'asc' | 'desc' }>({
    sortOrder: 'asc'
  });

  // Computed filtered users
  readonly filteredUsers = computed(() => {
    const users = this.usersService.users$();
    const filters = {
      searchTerm: this.globalSearch$(),
      role: this.roleFilter$() || undefined,
      status: this.statusFilter$() || undefined
    };

    let filtered = filterUsers(users as any, filters);
    filtered = applyColumnFilters(filtered, this.columnFilters$());

    if (this.sortState$().sortBy) {
      filtered = sortByField(
        filtered,
        this.sortState$().sortBy as any,
        this.sortState$().sortOrder
      );
    }

    return filtered.map(user => {
      const u = user as any;
      return {
        ...user,
        role: typeof u.role === 'object' && u.role ? u.role.name || u.role._id : u.role,
        lastLogin: u.lastLogin || u.lastLoginAt || '-'
      };
    });
  });

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'role', label: 'Rol', template: true, filterable: true },
    { key: 'createdAt', label: 'Registrado', sortable: true },
    { key: 'lastLogin', label: 'Último Login', sortable: true }
  ];

  get actions(): TableAction[] {
    return [
      { id: 'view', label: 'Ver', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
      { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
      {
        id: 'delete',
        label: 'Eliminar',
        icon: 'delete',
        class: 'text-red-600 hover:text-red-700',
        confirm: true,
        confirmMessage: this.i18n.translate('dashboard.users.deleteConfirmBody')
      }
    ];
  }

  constructor(
    readonly usersService: UsersService,
    private rolesService: RolesService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private i18n: I18nService,
    private destroyRef: DestroyRef
  ) {
    this.loadRoles();
    this.loadCurrentPage();
    this.usersService.loadStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.totalUsersCount.set(response.data.total);
        this.activeCount.set(response.data.active);
        this.adminCount.set((response.data as any).admin ?? 0);
      },
      error: () => {}
    });
  }

  private loadRoles(): void {
    this.rolesService.loadRoles(0, 100).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const rolesList = Array.isArray(response.data) ? response.data : response.data.items || [];
        console.log('Roles loaded for filter:', rolesList);
        this.rolesData.set(rolesList);
        console.log('Role filter options:', this.roleFilterOptions());
      },
      error: (err) => console.error('Error loading roles for filter:', err)
    });
  }

  onCreateUser(): void {
    this.showUserForm$.set(true);
    this.editingUserId$.set(null);
  }

  closeForm(): void {
    this.showUserForm$.set(false);
    this.editingUserId$.set(null);
  }

  onFormSubmitted(): void {
    this.closeForm();
    this.loadCurrentPage();
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const user = event.row as unknown as User;

    switch (event.action) {
      case 'view':
        this.viewUser(user);
        break;
      case 'edit':
        this.editUser(user);
        break;
      case 'delete':
        this.deleteUser(user);
        break;
    }
  }

  viewUser(user: User): void {
    const roleName = typeof user.role === 'object' ? user.role?.name || 'N/A' : user.role || 'N/A';
    const status = user.isActive ? 'Activo' : 'Inactivo';
    this.modalService
      .openConfirm(
        user.name,
        `Email: ${user.email}\nRol: ${roleName}\nEstado: ${status}\nRegistrado: ${user.createdAt}`
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  editUser(user: User): void {
    this.editingUserId$.set(extractId(user));
    this.showUserForm$.set(true);
  }

  deleteUser(user: User): void {
    this.modalService
      .openConfirm(
        this.i18n.translate('dashboard.users.deleteConfirmTitle'),
        this.i18n.translate('dashboard.users.deleteConfirmBody').replace('{name}', user.name),
        true
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.confirmed) {
          const userId = extractId(user);
          this.usersService.deleteUser(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
              this.updateStats();
              this.notificationService.toast(this.i18n.translate('dashboard.users.deleteSuccess'), 'success');
            },
            error: () => {
              this.notificationService.toast(this.i18n.translate('dashboard.users.deleteError'), 'error');
            }
          });
        }
      });
  }

  onGlobalSearch(): void {
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onRoleFilterChange(): void {
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onStatusFilterChange(): void {
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onColumnFilter(filters: Array<{ column: string; value: string }>): void {
    const filterMap: Record<string, string> = {};
    filters.forEach(filter => {
      filterMap[filter.column] = filter.value;
    });
    this.columnFilters$.set(filterMap);
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    this.sortState$.set({ sortBy: event.sortBy, sortOrder: event.sortOrder });
  }

  onPageChange(page: number): void {
    const skip = (page - 1) * this.pageSize;
    this.loadUsersWithFilters(skip);
  }

  clearAllFilters(): void {
    this.globalSearch$.set('');
    this.roleFilter$.set('');
    this.statusFilter$.set('');
    this.columnFilters$.set({});
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  private loadCurrentPage(): void {
    const { skip } = this.usersService.pagination();
    this.loadUsersWithFilters(skip);
  }

  private loadUsersWithFilters(skip: number): void {
    const filters = {
      role: this.roleFilter$() || undefined,
      status: this.statusFilter$() || undefined,
      email: this.globalSearch$() || undefined
    };

    this.usersService.loadUsers(skip, this.pageSize, filters).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast(this.i18n.translate('dashboard.users.loadError'), 'error');
      }
    });
  }

  private updateStats(): void {
    const users = this.usersService.users$();
    this.totalUsersCount.set(users.length);
    this.activeCount.set(users.filter(u => u.status === 'active').length);
    this.adminCount.set(users.filter(u => u.role === 'admin').length);
    this.suspendedCount.set(users.filter(u => u.status === 'suspended').length);
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters$.set(
      this.globalSearch$() !== '' ||
        this.roleFilter$() !== '' ||
        this.statusFilter$() !== '' ||
        Object.keys(this.columnFilters$()).length > 0
    );
  }
}
