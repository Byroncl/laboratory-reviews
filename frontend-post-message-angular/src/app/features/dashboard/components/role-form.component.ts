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
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss'
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
          this.permissions = this.permissionsService.permissions$();
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
    const roles = this.rolesService.roles$();
    const role = roles.find((r: Role) => (r._id ?? r.id) === this.editingRoleId);
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
