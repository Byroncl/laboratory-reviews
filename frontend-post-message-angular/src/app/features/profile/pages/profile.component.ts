import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileService } from '../services/profile.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { UserBadgePipe } from '../pipes';
import { buildProfileForm, buildPasswordForm } from '../utils';
import { PROFILE_MESSAGES } from '../constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, UserBadgePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  user$ = this.profileService.currentUser;
  loading$ = this.profileService.loading;
  saving$ = this.profileService.saving;
  error$ = this.profileService.error;
  isOwnProfile$ = this.profileService.isOwnProfile;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  get userInitial(): string {
    const user = this.user$();
    return ((user?.name ?? user?.username) || '?').charAt(0).toUpperCase();
  }

  constructor() {
    this.profileForm = buildProfileForm(this.fb);
    this.passwordForm = buildPasswordForm(this.fb);
  }

  ngOnInit(): void {
    this.profileService
      .loadUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const user = this.user$();
          if (user) {
            this.profileForm.patchValue({
              name: user.name || '',
              lastname: user.lastname || '',
              email: user.email || '',
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateProfile(): void {
    if (this.profileForm.invalid || !this.isOwnProfile$()) return;

    const dto = {
      name: this.profileForm.value.name,
      lastname: this.profileForm.value.lastname,
      email: this.profileForm.value.email,
    };

    this.profileService
      .updateProfile(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.toast(PROFILE_MESSAGES.UPDATED, 'success');
        },
        error: () => {
          this.notificationService.toast(PROFILE_MESSAGES.ERROR_UPDATING, 'error');
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.isOwnProfile$()) return;

    const dto = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };

    this.profileService
      .changePassword(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.notificationService.toast(PROFILE_MESSAGES.PASSWORD_CHANGED, 'success');
        },
        error: () => {
          this.notificationService.toast(PROFILE_MESSAGES.ERROR_CHANGING_PASSWORD, 'error');
        },
      });
  }
}
