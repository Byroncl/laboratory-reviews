import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';
import { RolesService } from '../../admin/services/roles.service';
import { PermissionsService } from '../../admin/services/permissions.service';
import { Role } from '../../../shared/models/role.model';
import { Permission } from '../../../shared/models/permission.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-gray-900">Asignar Permisos</h3>
          <p class="text-sm text-gray-500">Rol: <strong>{{ role?.name }}</strong></p>
        </div>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          {{ selectedPermissions.size }} seleccionados
        </span>
      </div>

      @if (permissionsService.loading$()) {
        <div class="flex items-center justify-center py-8">
          <app-spinner size="md" />
        </div>
      } @else {
        @if (groupedPermissions.length > 0) {
          <div class="space-y-4 max-h-80 overflow-y-auto pr-1">
            @for (group of groupedPermissions; track group.type) {
              <div class="border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                  <span class="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {{ formatType(group.type) }}
                  </span>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      (click)="selectAll(group.permissions)"
                      class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Todos
                    </button>
                    <span class="text-gray-300">|</span>
                    <button
                      type="button"
                      (click)="deselectAll(group.permissions)"
                      class="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>
                <div class="p-3 grid grid-cols-1 gap-2">
                  @for (perm of group.permissions; track (perm._id || perm.id)) {
                    <label class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded p-1 transition">
                      <input
                        type="checkbox"
                        [checked]="selectedPermissions.has((perm._id || perm.id)!)"
                        (change)="togglePermission((perm._id || perm.id)!)"
                        class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                      />
                      <span class="text-sm text-gray-700">{{ perm.name }}</span>
                      @if (perm.identifier) {
                        <span class="text-xs text-gray-400 font-mono ml-auto">{{ perm.identifier }}</span>
                      }
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="text-sm text-gray-500 italic text-center py-4">No hay permisos disponibles</p>
        }
      }

      <div class="flex gap-3 pt-2">
        <button
          type="button"
          (click)="onSave()"
          [disabled]="isLoading"
          class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          @if (isLoading) {
            <app-spinner size="sm" />
          }
          Guardar Permisos
        </button>
        <button
          type="button"
          (click)="onCancel()"
          [disabled]="isLoading"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  `,
  styles: [':host { display: block; }']
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
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initSelectedPermissions();
    this.permissionsService.loadPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.buildGroups(),
        error: () => {
          this.notificationService.toast('Error al cargar permisos', 'error');
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
          this.notificationService.toast('Permisos asignados correctamente', 'success');
          this.saved.emit();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.toast(error?.message || 'Error al asignar permisos', 'error');
        }
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
