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

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

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
    SkeletonComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 class="text-3xl font-bold text-primary">{{ 'sidebar.users' | t }}</h1>
        <button
          (click)="onCreateUser()"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm whitespace-nowrap"
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
      @if (isLoading) {
        <app-skeleton type="table"></app-skeleton>
      } @else {
        @if (filteredUsers.length > 0) {
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
            [currentPage]="currentPage"
            [totalPages]="totalPages"
            [total]="filteredUsers.length"
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
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  globalSearch = '';
  roleFilter = '';
  statusFilter = '';
  hasActiveFilters = false;
  totalUsersCount = 0;
  activeCount = 0;
  adminCount = 0;
  suspendedCount = 0;
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

  users: User[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '2024-06-13'
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria.garcia@example.com',
      role: 'editor',
      status: 'active',
      createdAt: '2024-02-10',
      lastLogin: '2024-06-12'
    },
    {
      id: '3',
      name: 'Carlos López',
      email: 'carlos.lopez@example.com',
      role: 'viewer',
      status: 'inactive',
      createdAt: '2024-03-05',
      lastLogin: '2024-05-20'
    },
    {
      id: '4',
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      role: 'editor',
      status: 'active',
      createdAt: '2024-01-20',
      lastLogin: '2024-06-13'
    },
    {
      id: '5',
      name: 'Pedro Sánchez',
      email: 'pedro.sanchez@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2023-12-10',
      lastLogin: '2024-06-11'
    },
    {
      id: '6',
      name: 'Sofia González',
      email: 'sofia.gonzalez@example.com',
      role: 'viewer',
      status: 'suspended',
      createdAt: '2024-04-01',
      lastLogin: '2024-04-15'
    },
    {
      id: '7',
      name: 'Luis Rodríguez',
      email: 'luis.rodriguez@example.com',
      role: 'editor',
      status: 'active',
      createdAt: '2024-05-12',
      lastLogin: '2024-06-10'
    },
    {
      id: '8',
      name: 'Elena Martinez',
      email: 'elena.martinez@example.com',
      role: 'viewer',
      status: 'active',
      createdAt: '2024-06-01',
      lastLogin: '2024-06-13'
    }
  ];

  get filteredUsers(): User[] {
    return this.users.filter(user => this.matchesAllFilters(user));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  constructor(
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.updateStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.updateStats();
    }, 1000);
  }

  private updateStats(): void {
    this.totalUsersCount = this.users.length;
    this.activeCount = this.users.filter(u => u.status === 'active').length;
    this.adminCount = this.users.filter(u => u.role === 'admin').length;
    this.suspendedCount = this.users.filter(u => u.status === 'suspended').length;
  }

  onCreateUser(): void {
    this.modalService
      .openConfirm(
        'Nuevo Usuario',
        'Funcionalidad de crear usuarios próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          this.notificationService.success('Usuario creado', 'El usuario se creó correctamente');
        }
      });
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
    this.modalService
      .openConfirm(
        `Editar: ${user.name}`,
        'Funcionalidad de edición próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
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
          try {
            this.users = this.users.filter(u => u.id !== user.id);
            this.updateStats();
            this.notificationService.toast('Usuario eliminado correctamente', 'success');
          } catch {
            this.notificationService.toast('Error al eliminar el usuario', 'error');
          }
        }
      });
  }

  onStatusChange(user: User, newStatus: User['status']): void {
    user.status = newStatus;
    this.updateStats();
    this.notificationService.toast('Estado actualizado', 'success');
  }

  onGlobalSearch(): void {
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  onRoleFilterChange(): void {
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  onStatusFilterChange(): void {
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
    this.users.sort((a, b) => {
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
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  clearAllFilters(): void {
    this.globalSearch = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.columnFilters = {};
    this.currentPage = 1;
    this.updateActiveFilters();
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
