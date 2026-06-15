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
import { I18nService } from '../../../core/services/i18n.service';
import { PermissionsService } from '../../admin/services/permissions.service';
import { Permission } from '../../../shared/models/permission.model';
import { PermissionFormComponent } from '../components/permission-form/permission-form.component';
import { BulkPermissionUploadComponent } from '../components/bulk-permission-upload/bulk-permission-upload.component';
import {
  extractId,
  filterPermissions,
  sortByField,
  applyColumnFilters
} from '../../admin';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent,
    PermissionFormComponent,
    BulkPermissionUploadComponent
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent {
  readonly pageSize = 10;

  // State signals
  readonly showPermissionForm$ = signal(false);
  readonly showBulkUpload$ = signal(false);
  readonly editingPermissionId$ = signal<string | null>(null);
  readonly globalSearch$ = signal('');
  readonly hasActiveFilters$ = signal(false);

  // Stats signals
  readonly totalPermissionsCount = signal(0);

  // Private filter/sort state
  private readonly columnFilters$ = signal<Record<string, string>>({});
  private readonly sortState$ = signal<{ sortBy?: string; sortOrder: 'asc' | 'desc' }>({
    sortOrder: 'asc'
  });

  // Computed filtered permissions
  readonly filteredPermissions = computed(() => {
    const permissions = this.permissionsService.permissions$();
    const filters = { searchTerm: this.globalSearch$() };

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
    { key: 'description', label: 'Descripción', sortable: true, filterable: true },
    { key: 'createdAt', label: 'Creado', sortable: true }
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
        confirmMessage: this.i18n.translate('dashboard.permissions.deleteConfirmInline')
      }
    ];
  }

  readonly currentPage$ = signal(1);

  constructor(
    readonly permissionsService: PermissionsService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {
    this.permissionsService
      .loadPermissions()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.updateStats(),
        error: () => this.notificationService.toast(this.i18n.translate('dashboard.permissions.loadError'), 'error')
      });
  }

  onCreatePermission(): void {
    this.showPermissionForm$.set(true);
    this.editingPermissionId$.set(null);
  }

  onBulkUpload(): void {
    this.showBulkUpload$.set(true);
  }

  closeBulkUpload(): void {
    this.showBulkUpload$.set(false);
  }

  onBulkUploadComplete(): void {
    this.closeBulkUpload();
    this.reloadPermissions();
  }

  closeForm(): void {
    this.showPermissionForm$.set(false);
    this.editingPermissionId$.set(null);
  }

  onFormSubmitted(): void {
    this.closeForm();
    this.reloadPermissions();
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
        `Descripción: ${permission['description'] ?? 'N/A'}\nCreado: ${permission.createdAt}`
      )
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  editPermission(permission: Permission): void {
    this.editingPermissionId$.set(extractId(permission));
    this.showPermissionForm$.set(true);
  }

  deletePermission(permission: Permission): void {
    this.modalService
      .openConfirm(
        this.i18n.translate('dashboard.permissions.deleteConfirmTitle'),
        this.i18n.translate('dashboard.permissions.deleteConfirmBody').replace('{name}', permission.name),
        true
      )
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        if (result.confirmed) {
          const permissionId = extractId(permission);
          this.permissionsService.deletePermission(permissionId).pipe(takeUntilDestroyed()).subscribe({
            next: () => {
              this.reloadPermissions();
              this.notificationService.toast(this.i18n.translate('dashboard.permissions.deleteSuccess'), 'success');
            },
            error: () => {
              this.notificationService.toast(this.i18n.translate('dashboard.permissions.deleteError'), 'error');
            }
          });
        }
      });
  }

  private reloadPermissions(): void {
    this.permissionsService.reloadPermissions().pipe(takeUntilDestroyed()).subscribe({
      next: () => this.updateStats(),
      error: () => this.notificationService.toast(this.i18n.translate('dashboard.permissions.loadError'), 'error')
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
    this.globalSearch$.set('');
    this.columnFilters$.set({});
    this.currentPage$.set(1);
    this.updateActiveFilters();
  }

  private updateStats(): void {
    this.totalPermissionsCount.set(this.permissionsService.permissions$().length);
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters$.set(
      this.globalSearch$() !== '' ||
        Object.keys(this.columnFilters$()).length > 0
    );
  }
}
