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
  template: `
    <div class="max-w-4xl mx-auto space-y-6 p-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
          {{ userInitial }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ user?.name }} {{ user?.lastname }}</h1>
          <p class="text-gray-500">@{{ user?.username }} · {{ user?.email }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Profile Form -->
        <div class="md:col-span-2 space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

            @if (loading) {
              <app-spinner></app-spinner>
            } @else {
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      formControlName="firstName"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      formControlName="lastName"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    formControlName="bio"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    formControlName="language"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <button
                  type="submit"
                  [disabled]="profileForm.invalid || saving"
                  class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium disabled:opacity-50"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </form>
            }
          </div>

          <!-- Change Password -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  formControlName="currentPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  [class.border-red-500]="isPasswordFieldInvalid('currentPassword')"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  formControlName="newPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  [class.border-red-500]="isPasswordFieldInvalid('newPassword')"
                />
                @if (isPasswordFieldInvalid('newPassword')) {
                  <p class="mt-1 text-sm text-red-500">Password must be at least 8 characters</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  [class.border-red-500]="passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched"
                />
                @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched) {
                  <p class="mt-1 text-sm text-red-500">Passwords do not match</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="passwordForm.invalid || changingPassword"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Account Details Sidebar -->
        <div class="md:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Account Details</h3>

            <div class="space-y-4 text-sm">
              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Username</p>
                <p class="font-medium text-gray-900 mt-1">{{ user?.username || '-' }}</p>
              </div>

              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Email</p>
                <p class="font-medium text-gray-900 mt-1 break-all">{{ user?.email || '-' }}</p>
              </div>

              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Status</p>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                  [class]="user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ user?.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Verified</p>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                  [class]="user?.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ user?.isVerified ? 'Verified' : 'Not verified' }}
                </span>
              </div>

              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Member Since</p>
                <p class="font-medium text-gray-900 mt-1">{{ user?.createdAt | date: 'mediumDate' }}</p>
              </div>

              @if (user?.lastLoginAt) {
                <div>
                  <p class="text-gray-500 text-xs uppercase tracking-wide font-medium">Last Login</p>
                  <p class="font-medium text-gray-900 mt-1">{{ user?.lastLoginAt | date: 'short' }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
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
