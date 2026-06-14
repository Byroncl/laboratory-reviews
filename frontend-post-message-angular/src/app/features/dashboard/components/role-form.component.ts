import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';
import { RolesService } from '../../admin/services/roles.service';
import { PermissionsService } from '../../admin/services/permissions.service';
import { Role } from '../../../shared/models/role.model';
import { Permission } from '../../../shared/models/permission.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Name Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Rol
          <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          formControlName="name"
          placeholder="Ej: Administrador"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('name')"
        />
        @if (isFieldInvalid('name')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('name') }}</p>
        }
      </div>

      <!-- Permissions Section -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Permisos Asignados
          <span class="text-red-500">*</span>
        </label>

        @if (permissions.length === 0) {
          <p class="text-sm text-gray-500 italic">Cargando permisos...</p>
        } @else {
          <div class="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
            @for (permission of permissions; track (permission.id || permission._id)) {
              <div class="flex items-center">
                <input
                  type="checkbox"
                  [id]="'perm-' + (permission.id || permission._id)"
                  (change)="onPermissionToggle((permission.id || permission._id))"
                  [checked]="isPermissionSelected((permission.id || permission._id))"
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label
                  [for]="'perm-' + (permission.id || permission._id)"
                  class="ml-3 text-sm text-gray-700 cursor-pointer hover:text-primary transition"
                >
                  {{ permission.name }}
                  <span class="text-xs text-gray-500 ml-1">({{ permission['type'] }})</span>
                </label>
              </div>
            }
          </div>
        }

        @if (isFieldInvalid('permissions')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('permissions') }}</p>
        }

        <p class="mt-2 text-xs text-gray-500">
          {{ selectedPermissionsCount }} permisos seleccionados
        </p>
      </div>

      <!-- Form Actions -->
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          [disabled]="form.invalid || isLoading"
          class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          @if (isLoading) {
            <app-spinner size="sm" />
          }
          {{ editingRoleId ? 'Actualizar Rol' : 'Crear Rol' }}
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
    </form>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RoleFormComponent implements OnInit, OnDestroy {
  @Input() editingRoleId: string | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  isLoading = false;
  permissions: Permission[] = [];
  selectedPermissions = new Set<string>();
  private destroy$ = new Subject<void>();

  get selectedPermissionsCount(): number {
    return this.selectedPermissions.size;
  }

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
    this.initializeForm();
    if (this.editingRoleId) {
      this.loadRoleData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPermissions(): void {
    this.permissionsService.loadPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.permissions = this.permissionsService.permissions();
        },
        error: () => {
          this.notificationService.toast('Error al cargar permisos', 'error');
        }
      });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],
      permissions: ['', [Validators.required]]
    });
  }

  private loadRoleData(): void {
    const roles = this.rolesService.roles();
    const role = roles.find(r => (r._id ?? r.id) === this.editingRoleId);
    if (role) {
      this.form.patchValue({
        name: role.name
      });
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((perm: unknown) => {
          const permId = typeof perm === 'string' ? perm : (perm as { _id?: string; id?: string })?._id ?? (perm as { _id?: string; id?: string })?.id;
          if (permId) this.selectedPermissions.add(permId);
        });
      }
      this.validatePermissions();
    }
  }

  getPermId(permission: Permission): string {
    return (permission._id ?? permission.id) as string;
  }

  isPermissionSelected(permissionId: string | undefined): boolean {
    if (!permissionId) return false;
    return this.selectedPermissions.has(permissionId);
  }

  onPermissionToggle(permissionId: string | undefined): void {
    if (!permissionId) return;
    if (this.selectedPermissions.has(permissionId)) {
      this.selectedPermissions.delete(permissionId);
    } else {
      this.selectedPermissions.add(permissionId);
    }
    this.validatePermissions();
  }

  private validatePermissions(): void {
    if (this.selectedPermissions.size > 0) {
      this.form.get('permissions')?.setErrors(null);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return fieldName === 'permissions'
        ? 'Debe seleccionar al menos un permiso'
        : 'Este campo es requerido';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.form.invalid || this.selectedPermissions.size === 0) {
      this.notificationService.toast('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    this.isLoading = true;
    const formValue = {
      name: this.form.get('name')?.value,
      permissions: Array.from(this.selectedPermissions)
    };

    if (this.editingRoleId) {
      this.rolesService.updateRole(this.editingRoleId, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast('Rol actualizado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al actualizar rol',
              'error'
            );
          }
        });
    } else {
      this.rolesService.createRole(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast('Rol creado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al crear rol',
              'error'
            );
          }
        });
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }
}
