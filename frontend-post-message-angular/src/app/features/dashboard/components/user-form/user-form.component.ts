import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../../shared/services/notification.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { UsersService } from '../../../admin/services/users.service';
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
export class UserFormComponent implements OnInit, OnDestroy {
  @Input() editingUserId: string | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.editingUserId) {
      this.loadUserData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const validators: any = {
      name: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ],
      lastname: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ],
      username: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ],
      email: [
        Validators.required,
        Validators.email
      ],
      type: [
        Validators.required
      ]
    };

    if (!this.editingUserId) {
      validators.password_hash = [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(200)
      ];
    }

    this.form = this.fb.group(validators);
  }

  private loadUserData(): void {
    const users = this.usersService.users$();
    const user = users.find(u => (u._id ?? u.id) === this.editingUserId);
    if (user) {
      this.form.patchValue({
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        type: user.type
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
