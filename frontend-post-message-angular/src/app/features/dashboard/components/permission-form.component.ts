import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';
import { PermissionsService } from '../../admin/services/permissions.service';
import { Permission, PermissionType } from '../../../shared/models/permission.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './permission-form.component.html',
  styleUrl: './permission-form.component.scss'
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
        type: permission['type']
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
