import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { PermissionsService } from '../../admin/services/permissions.service';
import { Permission, PermissionType } from '../../../shared/models/permission.model';
import { BulkPermissionUploadComponent } from '../components/bulk-permission-upload/bulk-permission-upload.component';
import {
  extractId,
  filterPermissions,
  sortByField,
  applyColumnFilters
} from '../../admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  readonly permissionsService = inject(PermissionsService);
  private notificationService = inject(NotificationService);
  private i18n = inject(I18nService);

  readonly pageSize = 10;
  readonly permissionTypes = Object.values(PermissionType);

  // Modal states
  readonly showCreateModal = signal(false);
  readonly showViewModal = signal(false);
  readonly selectedPermission = signal<Permission | null>(null);
  readonly isSavingPermission = signal(false);

  // Search & filters
  readonly globalSearch = signal('');
  readonly hasActiveFilters = signal(false);

  // Stats
  readonly totalPermissionsCount = signal(0);

  // Form
  permissionForm!: FormGroup;

  // Private filter/sort state
  private readonly columnFilters$ = signal<Record<string, string>>({});
  private readonly sortState$ = signal<{ sortBy?: string; sortOrder: 'asc' | 'desc' }>({
    sortOrder: 'asc'
  });

  readonly currentPage$ = signal(1);

  readonly filteredPermissions = computed(() => {
    const permissions = this.permissionsService.permissions$();
    const filters = { searchTerm: this.globalSearch() };

    let filtered = filterPermissions(permissions, filters);
    filtered = applyColumnFilters(filtered, this.columnFilters$());

    if (this.sortState$().sortBy) {
      filtered = sortByField(
        filtered,
        this.sortState$().sortBy as keyof Permission,
        this.sortState$().sortOrder
      );
    }

    return filtered;
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredPermissions().length / this.pageSize)
  );

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, filterable: true },
    { key: 'type', label: 'Tipo', sortable: true, filterable: true },
    { key: 'createdAt', label: 'Creado', sortable: true }
  ];

  readonly actions: TableAction[] = [
    { id: 'view', label: 'Ver', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
    { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
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
    this.initForm();
    this.permissionsService
      .loadPermissions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.updateStats(),
        error: () => this.notificationService.toast('Error al cargar permisos', 'error')
      });
  }

  private initForm(): void {
    this.permissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      type: ['', Validators.required]
    });
  }

  openCreateModal(): void {
    this.permissionForm.reset();
    this.selectedPermission.set(null);
    this.showCreateModal.set(true);
  }

  openViewModal(permission: Permission): void {
    this.selectedPermission.set(permission);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedPermission.set(null);
  }

  editPermission(permission: Permission): void {
    this.selectedPermission.set(permission);
    this.permissionForm.patchValue({
      name: permission.name,
      type: permission.type
    });
    this.showViewModal.set(false);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.selectedPermission.set(null);
    this.permissionForm.reset();
  }

  savePermission(): void {
    if (!this.permissionForm.valid) {
      this.notificationService.toast('Por favor completa los campos requeridos', 'warning');
      return;
    }

    this.isSavingPermission.set(true);
    const formValue = this.permissionForm.value;
    const permissionId = this.selectedPermission()?._id || this.selectedPermission()?.id;

    if (permissionId) {
      this.permissionsService.updatePermission(permissionId, formValue)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSavingPermission.set(false);
            this.notificationService.toast('✅ Permiso actualizado correctamente', 'success');
            this.closeCreateModal();
            this.reloadPermissions();
          },
          error: (err) => {
            this.isSavingPermission.set(false);
            this.notificationService.toast(`❌ Error al actualizar: ${err?.message || 'Error desconocido'}`, 'error');
            console.error('Update error:', err);
          }
        });
    } else {
      this.permissionsService.createPermission(formValue)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSavingPermission.set(false);
            this.notificationService.toast('✅ Permiso creado correctamente', 'success');
            this.closeCreateModal();
            this.reloadPermissions();
          },
          error: (err) => {
            this.isSavingPermission.set(false);
            this.notificationService.toast(`❌ Error al crear: ${err?.message || 'Error desconocido'}`, 'error');
            console.error('Create error:', err);
          }
        });
    }
  }

  deletePermission(permission: Permission): void {
    const permissionId = extractId(permission);
    this.permissionsService.deletePermission(permissionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.toast('✅ Permiso eliminado correctamente', 'success');
          this.reloadPermissions();
        },
        error: () => {
          this.notificationService.toast('❌ Error al eliminar', 'error');
        }
      });
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const permission = event.row as unknown as Permission;

    switch (event.action) {
      case 'view':
        this.openViewModal(permission);
        break;
      case 'edit':
        this.editPermission(permission);
        break;
      case 'delete':
        this.deletePermission(permission);
        break;
    }
  }


  private reloadPermissions(): void {
    this.permissionsService.reloadPermissions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.updateStats(),
        error: () => this.notificationService.toast('Error al cargar permisos', 'error')
      });
  }

  onGlobalSearch(): void {
    this.currentPage$.set(1);
    this.updateActiveFilters();
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
  }

  private updateStats(): void {
    this.totalPermissionsCount.set(this.permissionsService.permissions$().length);
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters.set(
      this.globalSearch() !== '' ||
      Object.keys(this.columnFilters$()).length > 0
    );
  }
}
