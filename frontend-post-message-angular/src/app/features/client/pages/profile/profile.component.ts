import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

import { ClientProfileService } from '../../services/client-profile.service';
import { CLIENT_MESSAGES, CLIENT_VALIDATION } from '../../constants';
import { nameValidator, passwordValidator, passwordMatchValidator } from '../../utils/form.validators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly profileService = inject(ClientProfileService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading$ = signal(false);
  readonly isLoadingProfile$ = signal(false);
  readonly error$ = signal<string | null>(null);
  readonly successMessage$ = signal<string | null>(null);
  readonly passwordError$ = signal<string | null>(null);
  readonly passwordSuccess$ = signal<string | null>(null);

  readonly profileForm = this.fb.group({
    name: ['', [Validators.required, nameValidator()]],
    lastname: ['', [Validators.required, nameValidator()]],
    username: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }],
  });

  readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required, passwordValidator()]],
      newPassword: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') }
  );

  readonly messages = CLIENT_MESSAGES.PROFILE;
  readonly validation = CLIENT_VALIDATION;

  constructor() {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoadingProfile$.set(true);
    this.error$.set(null);

    this.profileService
      .getMyProfile()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response: any) => {
          const profile = response.data;
          this.profileForm.patchValue({
            name: profile.name,
            lastname: profile.lastname,
            username: profile.username,
            email: profile.email,
          });
          this.isLoadingProfile$.set(false);
        },
        error: () => {
          this.error$.set('Error loading profile');
          this.isLoadingProfile$.set(false);
        },
      });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key =>
        this.profileForm.get(key)?.markAsTouched()
      );
      return;
    }

    this.isLoading$.set(true);
    this.error$.set(null);
    this.successMessage$.set(null);

    this.profileService
      .updateProfile({
        name: this.profileForm.get('name')?.value ?? '',
        lastname: this.profileForm.get('lastname')?.value ?? '',
      })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.successMessage$.set(this.messages.UPDATE_SUCCESS);
          this.profileForm.markAsPristine();
          this.isLoading$.set(false);
        },
        error: () => {
          this.error$.set(this.messages.UPDATE_ERROR);
          this.isLoading$.set(false);
        },
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key =>
        this.passwordForm.get(key)?.markAsTouched()
      );
      return;
    }

    this.isLoading$.set(true);
    this.passwordError$.set(null);
    this.passwordSuccess$.set(null);

    this.profileService
      .changePassword({
        currentPassword: this.passwordForm.get('currentPassword')?.value ?? '',
        newPassword: this.passwordForm.get('newPassword')?.value ?? '',
      })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.passwordSuccess$.set(this.messages.PASSWORD_SUCCESS);
          this.passwordForm.reset();
          this.isLoading$.set(false);
        },
        error: () => {
          this.passwordError$.set(this.messages.PASSWORD_ERROR);
          this.isLoading$.set(false);
        },
      });
  }
}
