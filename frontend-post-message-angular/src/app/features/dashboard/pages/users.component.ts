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
import { UsersService } from '../../admin/services/users.service';
import { User } from '../../../shared/models/user.model';
import { UserFormComponent } from '../components/user-form.component';

@Component({
  selector: 'app-users',
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
    UserFormComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Form Modal -->
      @if (showUserForm) {
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              {{ editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
            </h2>
            <button
              (click)="closeForm()"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <app-user-form
            [editingUserId]="editingUserId"
            (formSubmitted)="onFormSubmitted()"
            (formCancelled)="closeForm()"
          ></app-user-form>
        </div>
      }

      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 class="text-3xl font-bold text-primary">{{ 'sidebar.users' | t }}</h1>
        <button
          (click)="onCreateUser()"
          [disabled]="showUserForm"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm whitespace-nowrap disabled:opacity-50"
        >
          + Nuevo Usuario
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          [(ngModel)]="globalSearch"
          (input)="onGlobalSearch()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />
        <select
          [(ngModel)]="roleFilter"
          (change)="onRoleFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <select
          [(ngModel)]="statusFilter"
          (change)="onStatusFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="suspended">Suspendido</option>
        </select>
      </div>

      <!-- Active Filters Badge -->
      @if (hasActiveFilters) {
        <div class="flex flex-wrap gap-2">
          <button
            (click)="clearAllFilters()"
            class="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition font-medium"
          >
            ✕ Limpiar filtros
          </button>
        </div>
      }

      <!-- Loading State -->
      @if (usersService.loading$()) {
        <app-skeleton type="table"></app-skeleton>
      } @else {
        @if ((usersService.users$() ?? []).length > 0) {
          <!-- Users Table -->
          <app-table
            [columns]="columns"
            [data]="filteredUsers"
            [actions]="actions"
            [primaryColumnKey]="'name'"
            (actionTriggered)="onTableAction($event)"
            (sorted)="onSort($event)"
            (filtered)="onColumnFilter($event)"
          ></app-table>

          <!-- Pagination -->
          <app-pagination
            [currentPage]="usersService.currentPage()"
            [totalPages]="usersService.totalPages()"
            [total]="usersService.totalUsers()"
            [pageSize]="pageSize"
            (pageChanged)="onPageChange($event)"
          ></app-pagination>
        } @else {
          <div class="bg-white rounded-lg shadow p-8 text-center">
            <p class="text-gray-500 font-medium">No hay usuarios que coincidan con los filtros</p>
          </div>
        }
      }

      <!-- User Statistics -->
      <div class="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p class="text-secondary text-xs font-medium uppercase tracking-wide">Total Users</p>
          <p class="text-3xl font-bold text-primary mt-2">{{ totalUsersCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p class="text-secondary text-xs font-medium uppercase tracking-wide">Activos</p>
          <p class="text-3xl font-bold text-green-600 mt-2">{{ activeCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p class="text-secondary text-xs font-medium uppercase tracking-wide">Administradores</p>
          <p class="text-3xl font-bold text-yellow-600 mt-2">{{ adminCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p class="text-secondary text-xs font-medium uppercase tracking-wide">Suspendidos</p>
          <p class="text-3xl font-bold text-red-600 mt-2">{{ suspendedCount }}</p>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit, OnDestroy {
  pageSize = 10;
  globalSearch = '';
  roleFilter = '';
  statusFilter = '';
  hasActiveFilters = false;
  totalUsersCount = 0;
  activeCount = 0;
  adminCount = 0;
  suspendedCount = 0;
  showUserForm = false;
  editingUserId: string | null = null;
  private columnFilters: Record<string, string> = {};
  private destroy$ = new Subject<void>();

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'role', label: 'Rol', template: true, filterable: true },
    { key: 'status', label: 'Estado', template: true, filterable: true },
    { key: 'createdAt', label: 'Registrado', sortable: true },
    { key: 'lastLogin', label: 'Último Login', sortable: true }
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
      confirmMessage: '¿Estás seguro de que deseas eliminar este usuario?'
    }
  ];

  get filteredUsers(): User[] {
    return this.usersService.users$();
  }

  constructor(
    public usersService: UsersService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCurrentPage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateStats(): void {
    const users = this.usersService.users$();
    this.totalUsersCount = users.length;
    this.activeCount = users.filter(u => u.status === 'active').length;
    this.adminCount = users.filter(u => u.role === 'admin').length;
    this.suspendedCount = users.filter(u => u.status === 'suspended').length;
  }

  onCreateUser(): void {
    this.showUserForm = true;
    this.editingUserId = null;
  }

  closeForm(): void {
    this.showUserForm = false;
    this.editingUserId = null;
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
    this.modalService
      .openConfirm(
        user.name,
        `Email: ${user.email}\nRol: ${user.role}\nEstado: ${user.status}\nRegistrado: ${user.createdAt}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  editUser(user: User): void {
    this.editingUserId = (user._id ?? user.id) as string;
    this.showUserForm = true;
  }

  deleteUser(user: User): void {
    this.modalService
      .openConfirm(
        'Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar a ${user.name}?`,
        true
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          const userId = (user._id ?? user.id) as string;
          this.usersService.deleteUser(userId).pipe(takeUntil(this.destroy$)).subscribe({
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

  onStatusChange(user: User, newStatus: User['status']): void {
    user.status = newStatus;
    this.updateStats();
    this.notificationService.toast('Estado actualizado', 'success');
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
    this.columnFilters = {};
    filters.forEach(filter => {
      this.columnFilters[filter.column] = filter.value;
    });
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    const sortedUsers = [...this.usersService.users$()].sort((a, b) => {
      const aVal = a[event.sortBy as keyof User];
      const bVal = b[event.sortBy as keyof User];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return event.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();

      return event.sortOrder === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    this.usersService.users$.set(sortedUsers);
  }

  onPageChange(page: number): void {
    const skip = (page - 1) * this.pageSize;
    this.loadUsersWithFilters(skip);
  }

  private loadCurrentPage(): void {
    const { skip } = this.usersService.pagination();
    this.loadUsersWithFilters(skip);
  }

  private loadUsersWithFilters(skip: number): void {
    const filters = {
      role: this.roleFilter || undefined,
      status: this.statusFilter || undefined,
      email: this.globalSearch || undefined
    };

    this.usersService.loadUsers(skip, this.pageSize, filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast('Error al cargar usuarios', 'error');
      }
    });
  }

  clearAllFilters(): void {
    this.globalSearch = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.columnFilters = {};
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  private matchesAllFilters(user: User): boolean {
    // Global search
    if (
      this.globalSearch &&
      !user.name.toLowerCase().includes(this.globalSearch.toLowerCase()) &&
      !user.email.toLowerCase().includes(this.globalSearch.toLowerCase())
    ) {
      return false;
    }

    // Role filter
    if (this.roleFilter && user.role !== this.roleFilter) {
      return false;
    }

    // Status filter
    if (this.statusFilter && user.status !== this.statusFilter) {
      return false;
    }

    // Column filters
    for (const [column, filterValue] of Object.entries(this.columnFilters)) {
      const cellValue = String(user[column as keyof User] || '')
        .toLowerCase();
      if (!cellValue.includes(filterValue.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters =
      this.globalSearch !== '' ||
      this.roleFilter !== '' ||
      this.statusFilter !== '' ||
      Object.keys(this.columnFilters).length > 0;
  }
}
