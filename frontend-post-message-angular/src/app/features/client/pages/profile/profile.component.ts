import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { ClientProfileService } from '../../services/client-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profile = signal<any>(null);
  isLoadingProfile = signal(false);
  isUpdating = signal(false);
  isChangingPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  passwordErrorMessage = signal('');
  passwordSuccessMessage = signal('');

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private profileService: ClientProfileService,
    private fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
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

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.profileService.getMyProfile().subscribe({
      next: (response: any) => {
        this.profile.set(response.data);
        this.profileForm.patchValue({
          name: response.data.name,
          lastname: response.data.lastname,
          username: response.data.username,
          email: response.data.email,
        });
        this.isLoadingProfile.set(false);
      },
      error: () => {
        this.isLoadingProfile.set(false);
      },
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdating.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const data = {
        name: this.profileForm.get('name')?.value,
        lastname: this.profileForm.get('lastname')?.value,
      };

      this.profileService.updateProfile(data).subscribe({
        next: () => {
          this.successMessage.set('Perfil actualizado correctamente');
          this.profileForm.markAsPristine();
          this.isUpdating.set(false);
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err: any) => {
          this.errorMessage.set('Error al actualizar el perfil');
          this.isUpdating.set(false);
        },
      });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword.set(true);
      this.passwordErrorMessage.set('');
      this.passwordSuccessMessage.set('');

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.profileService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.passwordSuccessMessage.set('Contraseña cambiada correctamente');
          this.passwordForm.reset();
          this.isChangingPassword.set(false);
          setTimeout(() => this.passwordSuccessMessage.set(''), 3000);
        },
        error: () => {
          this.passwordErrorMessage.set('Error al cambiar la contraseña');
          this.isChangingPassword.set(false);
        },
      });
    }
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
