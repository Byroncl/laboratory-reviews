import { Component, signal, computed } from '@angular/core';
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
import { UsersService } from '../../admin/services/users.service';
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
  readonly roleFilterOptions = ROLE_FILTER_OPTIONS;
  readonly statusFilterOptions = STATUS_FILTER_OPTIONS;

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

    return filtered;
  });

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'role', label: 'Rol', template: true, filterable: true },
    { key: 'status', label: 'Estado', template: true, filterable: true },
    { key: 'createdAt', label: 'Registrado', sortable: true },
    { key: 'lastLogin', label: 'Último Login', sortable: true }
  ];

  readonly actions: TableAction[] = [
    { id: 'view', label: 'Ver', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
    { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
    {
      id: 'toggle-status',
      label: 'Activar/Desactivar',
      icon: 'edit',
      class: 'text-orange-600 hover:text-orange-700'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'delete',
      class: 'text-red-600 hover:text-red-700',
      confirm: true,
      confirmMessage: '¿Estás seguro de que deseas eliminar este usuario?'
    }
  ];

  constructor(
    readonly usersService: UsersService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {
    this.loadCurrentPage();
    this.usersService.loadStats().pipe(takeUntilDestroyed()).subscribe({
      next: response => {
        this.totalUsersCount.set(response.data.total);
        this.activeCount.set(response.data.active);
        this.adminCount.set((response.data as any).admin ?? 0);
      },
      error: () => {}
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
      case 'toggle-status':
        this.toggleUserStatus(user);
        break;
      case 'delete':
        this.deleteUser(user);
        break;
    }
  }

  toggleUserStatus(user: User): void {
    const userId = extractId(user);
    const isActive = user.isActive ?? user.status === 'active';
    const action$ = isActive
      ? this.usersService.deactivateUser(userId)
      : this.usersService.activateUser(userId);

    action$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        const statusMsg = isActive ? 'desactivado' : 'activado';
        this.notificationService.toast(`Usuario ${statusMsg} correctamente`, 'success');
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast('Error al cambiar el estado del usuario', 'error');
      }
    });
  }

  viewUser(user: User): void {
    this.modalService
      .openConfirm(
        user.name,
        `Email: ${user.email}\nRol: ${user.role}\nEstado: ${user.status}\nRegistrado: ${user.createdAt}`
      )
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  editUser(user: User): void {
    this.editingUserId$.set(extractId(user));
    this.showUserForm$.set(true);
  }

  deleteUser(user: User): void {
    this.modalService
      .openConfirm(
        'Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar a ${user.name}?`,
        true
      )
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        if (result.confirmed) {
          const userId = extractId(user);
          this.usersService.deleteUser(userId).pipe(takeUntilDestroyed()).subscribe({
            next: () => {
              this.updateStats();
              this.notificationService.toast('Usuario eliminado correctamente', 'success');
            },
            error: () => {
              this.notificationService.toast('Error al eliminar el usuario', 'error');
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

    this.usersService.loadUsers(skip, this.pageSize, filters).pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast('Error al cargar usuarios', 'error');
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
