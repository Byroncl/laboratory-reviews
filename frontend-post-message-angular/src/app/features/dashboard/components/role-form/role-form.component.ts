import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
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
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, TranslatePipe],
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
    private notificationService: NotificationService,
    private i18n: I18nService
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
          this.notificationService.toast(this.i18n.translate('dashboard.permissions.loadError'), 'error');
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
        ? this.i18n.translate('dashboard.roles.validation.permissionsRequired')
        : this.i18n.translate('dashboard.common.validation.required');
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return this.i18n.translate('dashboard.common.validation.minLength').replace('{n}', minLength.toString());
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return this.i18n.translate('dashboard.common.validation.maxLength').replace('{n}', maxLength.toString());
    }

    return this.i18n.translate('dashboard.common.validation.invalid');
  }

  onSubmit(): void {
    if (this.form.invalid || this.selectedPermissions.size === 0) {
      this.notificationService.toast(this.i18n.translate('dashboard.roles.formIncomplete'), 'error');
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
            this.notificationService.toast(this.i18n.translate('dashboard.roles.updateSuccess'), 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || this.i18n.translate('dashboard.roles.updateError'),
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
            this.notificationService.toast(this.i18n.translate('dashboard.roles.createSuccess'), 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || this.i18n.translate('dashboard.roles.createError'),
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
