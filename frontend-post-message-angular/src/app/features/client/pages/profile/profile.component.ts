import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { ClientProfileService } from '../../services/client-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile">
      <div class="container">
        <h2>Mi Perfil</h2>

        <div class="profile-card" *ngIf="profile()">
          <div class="section">
            <h3>Información Personal</h3>
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
              <div class="form-group">
                <label for="name">Nombre</label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="lastname">Apellido</label>
                <input
                  id="lastname"
                  type="text"
                  formControlName="lastname"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="username">Usuario</label>
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  class="form-control"
                  [readonly]="true"
                />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-control"
                  [readonly]="true"
                />
              </div>

              <div class="button-group">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="!profileForm.dirty || isUpdating()"
                >
                  {{ isUpdating() ? 'Guardando...' : 'Actualizar' }}
                </button>
              </div>
              <div class="error-message" *ngIf="errorMessage()">
                {{ errorMessage() }}
              </div>
              <div class="success-message" *ngIf="successMessage()">
                {{ successMessage() }}
              </div>
            </form>
          </div>

          <div class="section">
            <h3>Cambiar Contraseña</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
              <div class="form-group">
                <label for="currentPassword">Contraseña Actual</label>
                <input
                  id="currentPassword"
                  type="password"
                  formControlName="currentPassword"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="newPassword">Nueva Contraseña</label>
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmar Contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  class="form-control"
                />
              </div>

              <div class="button-group">
                <button
                  type="submit"
                  class="btn btn-warning"
                  [disabled]="!passwordForm.valid || isChangingPassword()"
                >
                  {{ isChangingPassword() ? 'Cambiando...' : 'Cambiar Contraseña' }}
                </button>
              </div>
              <div class="error-message" *ngIf="passwordErrorMessage()">
                {{ passwordErrorMessage() }}
              </div>
              <div class="success-message" *ngIf="passwordSuccessMessage()">
                {{ passwordSuccessMessage() }}
              </div>
            </form>
          </div>

          <div class="section">
            <h3>Información de la Cuenta</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="label">Tipo de Usuario:</span>
                <span class="value">{{ profile()?.type }}</span>
              </div>
              <div class="info-item">
                <span class="label">Estado:</span>
                <span class="value" [class.active]="profile()?.isActive">
                  {{ profile()?.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Creado:</span>
                <span class="value">{{ profile()?.createdAt | date: 'long' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Última actualización:</span>
                <span class="value">{{ profile()?.updatedAt | date: 'long' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="isLoadingProfile()">
          Cargando tu perfil...
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      h2 {
        font-size: 24px;
        color: #333;
        margin-bottom: 24px;
      }

      .profile-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .section {
        padding: 24px;
        border-bottom: 1px solid #eee;
      }

      .section:last-child {
        border-bottom: none;
      }

      h3 {
        font-size: 18px;
        color: #333;
        margin-bottom: 16px;
        margin-top: 0;
      }

      .form-group {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
      }

      label {
        font-weight: 600;
        margin-bottom: 6px;
        color: #555;
        font-size: 14px;
      }

      .form-control {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      }

      .form-control:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .form-control[readonly] {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }

      .button-group {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #0056b3;
      }

      .btn-warning {
        background-color: #ffc107;
        color: #333;
      }

      .btn-warning:hover:not(:disabled) {
        background-color: #e0a800;
      }

      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .error-message {
        color: #dc3545;
        font-size: 12px;
        margin-top: 12px;
      }

      .success-message {
        color: #28a745;
        font-size: 12px;
        margin-top: 12px;
      }

      .info-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: #666;
      }

      .value {
        color: #333;
      }

      .value.active {
        color: #28a745;
        font-weight: 600;
      }

      .loading {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
    `,
  ],
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
