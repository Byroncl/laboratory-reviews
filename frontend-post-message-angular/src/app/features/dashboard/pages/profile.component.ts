import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersService } from '../../admin/services/users.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { User, ChangePasswordDto, UpdateUserDto } from '../../../shared/models/user.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = false;
  saving = false;
  changingPassword = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  private destroy$ = new Subject<void>();

  get userInitial(): string {
    return (this.user?.name || this.user?.username || '?').charAt(0).toUpperCase();
  }

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private notificationService: NotificationService,
  ) {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      bio: [''],
      language: ['en'],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.loading = true;
    this.usersService.getProfile().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.user = response.data;
        this.profileForm.patchValue({
          firstName: this.user?.firstName ?? '',
          lastName: this.user?.lastName ?? '',
          bio: this.user?.bio ?? '',
          language: this.user?.preferredLanguage ?? this.user?.language ?? 'en',
        });
        this.loading = false;
      },
      error: () => {
        this.notificationService.toast('Error loading profile', 'error');
        this.loading = false;
      },
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid || !this.user) return;

    this.saving = true;
    const userId = (this.user._id ?? this.user.id) as string;
    const dto: UpdateUserDto = this.profileForm.value;

    this.usersService.updateUser(userId, dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.user = response.data;
        this.saving = false;
        this.notificationService.toast('Profile updated successfully', 'success');
      },
      error: () => {
        this.saving = false;
        this.notificationService.toast('Error updating profile', 'error');
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.user) return;

    this.changingPassword = true;
    const userId = (this.user._id ?? this.user.id) as string;
    const dto: ChangePasswordDto = this.passwordForm.value;

    this.usersService.changePassword(userId, dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordForm.reset();
        this.notificationService.toast('Password changed successfully', 'success');
      },
      error: (err) => {
        this.changingPassword = false;
        const message = err?.error?.message || 'Error changing password';
        this.notificationService.toast(message, 'error');
      },
    });
  }

  isPasswordFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  private passwordMatchValidator(group: FormGroup): { passwordMismatch: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
}
