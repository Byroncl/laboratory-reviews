import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/services/notification.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { UsersService } from '../../../admin/services/users.service';
import { RolesService } from '../../../admin/services/roles.service';
import { User } from '../../../../shared/models/user.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, TranslatePipe],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() editingUserId: string | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  isLoading = false;
  readonly roles = signal<any[]>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private rolesService: RolesService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) { }

  ngOnInit(): void {
    this.loadRoles();
    this.initializeForm();
    if (this.editingUserId) {
      this.loadUserData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingUserId'] && !changes['editingUserId'].firstChange) {
      if (this.editingUserId) {
        this.loadUserData();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const config: any = {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      type: ['user']
    };

    if (!this.editingUserId) {
      config.password_hash = ['', [Validators.required, Validators.minLength(6), Validators.maxLength(200)]];
    }

    this.form = this.fb.group(config);
  }

  private loadUserData(): void {
    const users = this.usersService.users$();
    const user = users.find(u => (u._id ?? u.id) === this.editingUserId);
    if (user) {
      const roleValue = typeof user.role === 'object'
        ? (user.role as any)?._id || (user.role as any)?.id
        : user.role;
      this.form.patchValue({
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: roleValue || '',
        type: user.type || 'user'
      });
    }
  }

  private loadRoles(): void {
    this.rolesService.loadRoles(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const rolesList = Array.isArray(response.data) ? response.data : response.data.items || [];
          this.roles.set(rolesList);
        },
        error: (err) => {
          console.error('Error loading roles:', err);
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) return this.i18n.translate('dashboard.common.validation.required');
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return this.i18n.translate('dashboard.common.validation.minLength').replace('{n}', minLength.toString());
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return this.i18n.translate('dashboard.common.validation.maxLength').replace('{n}', maxLength.toString());
    }
    if (field.hasError('email')) return this.i18n.translate('dashboard.users.validation.emailInvalid');

    return this.i18n.translate('dashboard.common.validation.invalid');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.toast(this.i18n.translate('dashboard.users.formIncomplete'), 'error');
      return;
    }

    this.isLoading = true;

    if (this.editingUserId) {
      this.usersService.updateUser(this.editingUserId, this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast(this.i18n.translate('dashboard.users.updateSuccess'), 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || this.i18n.translate('dashboard.users.updateError'),
              'error'
            );
          }
        });
    } else {
      this.usersService.createUser(this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast(this.i18n.translate('dashboard.users.createSuccess'), 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || this.i18n.translate('dashboard.users.createError'),
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
