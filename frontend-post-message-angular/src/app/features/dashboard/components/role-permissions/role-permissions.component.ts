import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/services/notification.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { RolesService } from '../../../admin/services/roles.service';
import { PermissionsService } from '../../../admin/services/permissions.service';
import { Role } from '../../../../shared/models/role.model';
import { Permission } from '../../../../shared/models/permission.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, TranslatePipe],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.scss'
})
export class RolePermissionsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) role!: Role;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  selectedPermissions = new Set<string>();
  isLoading = false;
  groupedPermissions: Array<{ type: string; permissions: Permission[] }> = [];

  private destroy$ = new Subject<void>();

  constructor(
    public permissionsService: PermissionsService,
    private rolesService: RolesService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.initSelectedPermissions();
    this.permissionsService.loadPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.buildGroups(),
        error: () => {
          this.notificationService.toast(this.i18n.translate('dashboard.permissions.loadError'), 'error');
          this.buildGroups();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSelectedPermissions(): void {
    if (!this.role.permissions) return;
    this.role.permissions.forEach((perm: unknown) => {
      if (typeof perm === 'string') {
        this.selectedPermissions.add(perm);
      } else {
        const p = perm as Permission;
        const id = p._id ?? p.id;
        if (id) this.selectedPermissions.add(id);
      }
    });
  }

  private buildGroups(): void {
    const all = this.permissionsService.permissions$();
    const map = new Map<string, Permission[]>();

    all.forEach(p => {
      const key = (p['type'] as string) || 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });

    this.groupedPermissions = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([type, permissions]) => ({ type, permissions }));
  }

  togglePermission(id: string): void {
    if (this.selectedPermissions.has(id)) {
      this.selectedPermissions.delete(id);
    } else {
      this.selectedPermissions.add(id);
    }
  }

  selectAll(permissions: Permission[]): void {
    permissions.forEach(p => {
      const id = p._id ?? p.id;
      if (id) this.selectedPermissions.add(id);
    });
  }

  deselectAll(permissions: Permission[]): void {
    permissions.forEach(p => {
      const id = p._id ?? p.id;
      if (id) this.selectedPermissions.delete(id);
    });
  }

  formatType(type: string): string {
    const labels: Record<string, string> = {
      user: 'Usuarios',
      roles: 'Roles',
      permissions: 'Permisos',
      comments: 'Comentarios',
      clients: 'Clientes',
      statistics: 'Estadísticas',
      audits: 'Auditoría',
      other: 'Otros',
    };
    return labels[type] ?? type;
  }

  onSave(): void {
    const roleId = (this.role._id ?? this.role.id) as string;
    const permissionIds = Array.from(this.selectedPermissions);
    this.isLoading = true;

    this.rolesService.assignPermissions(roleId, permissionIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.toast(this.i18n.translate('dashboard.roles.permissionsAssignSuccess'), 'success');
          this.saved.emit();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.toast(error?.message || this.i18n.translate('dashboard.roles.permissionsAssignError'), 'error');
        }
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
