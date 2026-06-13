import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';
import { PermissionsService } from '../../admin/services/permissions.service';
import { Permission } from '../../../shared/models/permission.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

export enum PermissionType {
  USER = 'user',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  COMMENTS = 'comments',
  CLIENTS = 'clients',
  STATISTICS = 'statistics',
  AUDITS = 'audits'
}

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Name Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Permiso
          <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          formControlName="name"
          placeholder="Ej: Crear Usuario"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('name')"
        />
        @if (isFieldInvalid('name')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('name') }}</p>
        }
      </div>

      <!-- Type Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Categoría del Permiso
          <span class="text-red-500">*</span>
        </label>
        <select
          formControlName="type"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('type')"
        >
          <option value="">Seleccionar categoría...</option>
          @for (type of permissionTypes; let i = $index) {
            <option [value]="type">{{ formatType(type) }}</option>
          }
        </select>
        @if (isFieldInvalid('type')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('type') }}</p>
        }
      </div>

      <!-- Type Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm text-blue-800">
          <strong>Tipos disponibles:</strong>
        </p>
        <ul class="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
          <li><strong>user</strong> - Permisos relacionados con gestión de usuarios</li>
          <li><strong>roles</strong> - Permisos relacionados con gestión de roles</li>
          <li><strong>permissions</strong> - Permisos relacionados con gestión de permisos</li>
          <li><strong>comments</strong> - Permisos relacionados con comentarios</li>
          <li><strong>clients</strong> - Permisos relacionados con clientes</li>
          <li><strong>statistics</strong> - Permisos para acceder a estadísticas</li>
          <li><strong>audits</strong> - Permisos para acceder a auditoría</li>
        </ul>
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
          {{ editingPermissionId ? 'Actualizar Permiso' : 'Crear Permiso' }}
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
export class PermissionFormComponent implements OnInit, OnDestroy {
  @Input() editingPermissionId: string | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  isLoading = false;
  permissionTypes = Object.values(PermissionType);
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private permissionsService: PermissionsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.editingPermissionId) {
      this.loadPermissionData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      type: ['', [Validators.required]]
    });
  }

  private loadPermissionData(): void {
    const permissions = this.permissionsService.permissions();
    const permission = permissions.find(p => (p._id ?? p.id) === this.editingPermissionId);
    if (permission) {
      this.form.patchValue({
        name: permission.name,
        type: permission.type
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) return 'Este campo es requerido';
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

  formatType(type: string): string {
    const formatted: Record<string, string> = {
      user: 'Usuarios',
      roles: 'Roles',
      permissions: 'Permisos',
      comments: 'Comentarios',
      clients: 'Clientes',
      statistics: 'Estadísticas',
      audits: 'Auditoría'
    };
    return formatted[type] || type;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.toast('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    this.isLoading = true;

    if (this.editingPermissionId) {
      this.permissionsService.updatePermission(this.editingPermissionId, this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast('Permiso actualizado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al actualizar permiso',
              'error'
            );
          }
        });
    } else {
      this.permissionsService.createPermission(this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast('Permiso creado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al crear permiso',
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
