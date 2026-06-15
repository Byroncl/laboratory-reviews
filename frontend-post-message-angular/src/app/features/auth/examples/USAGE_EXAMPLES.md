# Auth Module - Usage Examples

Este documento muestra cómo usar los patrones escalables creados en el módulo de auth.

## 1. Agregar Más Validadores

### Ejemplo: Validador de NO-números-en-username

```typescript
// src/app/features/auth/validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validar que username NO contiene números
 */
export function noNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const hasNumbers = /\d/.test(control.value);
    return hasNumbers ? { hasNumbers: true } : null;
  };
}

/**
 * Validar que email NO es de dominio público (gmail, yahoo, etc)
 */
export function corporateEmailValidator(): ValidatorFn {
  const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const domain = control.value.split('@')[1]?.toLowerCase();
    const isPublic = publicDomains.includes(domain);
    
    return isPublic ? { notCorporateEmail: true } : null;
  };
}
```

### Uso en componentes:

```typescript
// En tu componente
import { corporateEmailValidator, noNumbersValidator } from '../../validators/custom-validators';

registerForm = this.fb.group({
  username: ['', [...AUTH_FORM_VALIDATORS.USERNAME, noNumbersValidator()]],
  email: ['', [...AUTH_FORM_VALIDATORS.EMAIL, corporateEmailValidator()]],
  password: ['', [...AUTH_FORM_VALIDATORS.PASSWORD, passwordStrengthValidator()]]
});
```

---

## 2. Nuevo Formulario - Change Password

Ejemplo de cómo crear un nuevo formulario reutilizando utilities y validadores:

### Componente:

```typescript
// src/app/features/auth/pages/change-password/change-password.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AUTH_FORM_VALIDATORS } from '../../constants';
import { passwordStrengthValidator, passwordMatchValidator } from '../../validators/custom-validators';
import { getFormErrors, hasFieldError, markFormAsTouched } from '../../utils';
import { FormErrorDirective } from '../../directives/form-error.directive';
import { ErrorMessagePipe } from '../../pipes/error-message.pipe';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, FormErrorDirective, ErrorMessagePipe],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  // ✅ REUTILIZA: AUTH_FORM_VALIDATORS + custom validators
  changePasswordForm = this.fb.group(
    {
      currentPassword: ['', AUTH_FORM_VALIDATORS.PASSWORD],
      newPassword: ['', [...AUTH_FORM_VALIDATORS.PASSWORD, passwordStrengthValidator()]],
      confirmPassword: ['', AUTH_FORM_VALIDATORS.CONFIRM_PASSWORD]
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') }
  );

  // ✅ REUTILIZA: Utilities
  get formErrors() {
    return getFormErrors(this.changePasswordForm);
  }

  hasError(field: string): boolean {
    return hasFieldError(this.changePasswordForm, field);
  }

  onSubmit(): void {
    markFormAsTouched(this.changePasswordForm);

    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword } = this.changePasswordForm.value;
      
      this.authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      }).pipe(takeUntilDestroyed()).subscribe({
        next: () => {
          // Éxito
        },
        error: (err) => {
          // Error automáticamente mapeado por ErrorMessagePipe
        }
      });
    }
  }
}
```

### Template:

```html
<!-- change-password.component.html -->
<form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="space-y-5 max-w-md">
  <!-- Current Password -->
  <div>
    <label class="block text-sm font-medium text-primary mb-2">
      Current Password
    </label>
    <input
      type="password"
      formControlName="currentPassword"
      appFormError
      [control]="changePasswordForm.get('currentPassword')!"
      class="w-full px-4 py-3 rounded-lg border border-gray-300"
    />
    @if (hasError('currentPassword')) {
      <p class="text-red-500 text-xs mt-1.5">{{ formErrors['currentPassword'] }}</p>
    }
  </div>

  <!-- New Password with Strength Indicator -->
  <div>
    <label class="block text-sm font-medium text-primary mb-2">
      New Password
    </label>
    <input
      type="password"
      formControlName="newPassword"
      appFormError
      appPasswordStrength
      [control]="changePasswordForm.get('newPassword')!"
      class="w-full px-4 py-3 rounded-lg border border-gray-300"
    />
  </div>

  <!-- Confirm Password -->
  <div>
    <label class="block text-sm font-medium text-primary mb-2">
      Confirm Password
    </label>
    <input
      type="password"
      formControlName="confirmPassword"
      appFormError
      [control]="changePasswordForm.get('confirmPassword')!"
      class="w-full px-4 py-3 rounded-lg border border-gray-300"
    />
    @if (changePasswordForm.hasError('passwordMismatch') && changePasswordForm.get('confirmPassword')?.touched) {
      <p class="text-red-500 text-xs mt-1.5">Passwords do not match</p>
    }
  </div>

  <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg">
    Change Password
  </button>
</form>
```

---

## 3. Migrar a Secure Storage

### Paso 1: Crear SecureStorageService

```typescript
// src/app/features/auth/services/secure-storage.service.ts
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { AUTH_STORAGE_KEYS } from '../constants';

/**
 * Secure storage usando encriptación AES-256 (example)
 * En producción, usa: crypto-js, TweetNaCl.js, o librería nativa Web Crypto API
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService extends StorageService {
  // En producción, inyecta CryptoService
  // private crypto = inject(CryptoService);

  override setToken(token: string): void {
    // const encrypted = this.crypto.encrypt(token);
    // localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, encrypted);
    
    // Para demo, usa localStorage directo:
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }

  override getToken(): string | null {
    const encrypted = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (!encrypted) return null;
    
    // const decrypted = this.crypto.decrypt(encrypted);
    // return decrypted;
    
    return encrypted;
  }

  // Implementa mismo patrón para refresh token, user, etc
}
```

### Paso 2: Cambiar el provider

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { StorageService } from './features/auth/services/storage.service';
import { SecureStorageService } from './features/auth/services/secure-storage.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ CAMBIO: De StorageService a SecureStorageService
    { provide: StorageService, useClass: SecureStorageService },
    // ... otros providers
  ]
};
```

**Ventaja**: Todos los componentes siguen usando `inject(StorageService)` sin cambios 🎯

---

## 4. Reutilizar Directives/Pipes en Otros Formularios

### Ejemplo: Formulario de Perfil con Password Reset

```typescript
// src/app/features/profile/pages/profile-edit/profile-edit.component.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

// ✅ REUTILIZA: Directives y Pipes del módulo auth
import { PasswordStrengthDirective } from '../../../auth/directives/password-strength.directive';
import { FormErrorDirective } from '../../../auth/directives/form-error.directive';
import { ErrorMessagePipe } from '../../../auth/pipes/error-message.pipe';
import { PasswordStrengthPipe } from '../../../auth/pipes/password-strength.pipe';

// ✅ REUTILIZA: Validadores
import { passwordStrengthValidator, passwordMatchValidator } from '../../../auth/validators/custom-validators';
import { AUTH_FORM_VALIDATORS } from '../../../auth/constants';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PasswordStrengthDirective,
    FormErrorDirective,
    ErrorMessagePipe,
    PasswordStrengthPipe
  ],
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-5">
      <!-- Nombre (reusable) -->
      <div>
        <input
          type="text"
          formControlName="fullName"
          appFormError
          [control]="profileForm.get('fullName')!"
          placeholder="Full name"
        />
      </div>

      <!-- Password reset - CON password strength indicator (directive reutilizado) -->
      <div>
        <input
          type="password"
          formControlName="newPassword"
          appFormError
          appPasswordStrength
          [control]="profileForm.get('newPassword')!"
          placeholder="New password (optional)"
        />
        
        <!-- Mostrar strength score con pipe reutilizado -->
        @if (profileForm.get('newPassword')?.value) {
          <div class="mt-2 text-sm">
            Strength: {{ profileForm.get('newPassword')?.value | passwordStrength | json }}
          </div>
        }
      </div>

      <button type="submit">Save Profile</button>
    </form>
  `
})
export class ProfileEditComponent {
  profileForm = this.fb.group({
    fullName: ['', AUTH_FORM_VALIDATORS.FULL_NAME],
    newPassword: ['', [...AUTH_FORM_VALIDATORS.PASSWORD, passwordStrengthValidator()]]
  });

  constructor(private fb: FormBuilder) {}

  onSubmit(): void {
    // ...
  }
}
```

**Resultado**: Sin copiar código, reutilizas directives, pipes y validadores 🎯

---

## 5. Mantener Consistencia - Error Handling

### Patrón de Error Handling Consistente

```typescript
// src/app/features/profile/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// ✅ REUTILIZA: Error mapper del módulo auth
import { mapAuthError } from '../../auth/utils/auth-error-mapper.util';
import { AUTH_MESSAGES } from '../../auth/constants';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  updateProfile(data: any) {
    return this.http.put('/api/profile', data).pipe(
      catchError((error: HttpErrorResponse) => {
        // ✅ USA: mapAuthError para consistencia
        const authError = mapAuthError(error);
        return throwError(() => authError);
      })
    );
  }
}
```

### En el componente:

```typescript
// profile-edit.component.ts
import { ErrorMessagePipe } from '../../auth/pipes/error-message.pipe';

@Component({
  imports: [ErrorMessagePipe],
  template: `
    @if (error$()) {
      <div class="bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
        <!-- ✅ CONSISTENCIA: Todos los errores pasan por ErrorMessagePipe -->
        <p>{{ error$().code | errorMessage }}</p>
      </div>
    }
  `
})
export class ProfileEditComponent {
  error$ = signal<IAuthError | null>(null);

  onSubmit() {
    this.profileService.updateProfile(this.form.value).subscribe({
      next: (res) => { /* ... */ },
      error: (err: IAuthError) => {
        this.error$.set(err);
        // ✅ El mensaje ya está mapeado, el pipe simplemente lo traduce
      }
    });
  }
}
```

---

## 6. Bonus: Settings/Preferences Form

Ejemplo completo que combina todo:

```typescript
// src/app/features/settings/pages/settings/settings.component.ts
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { AUTH_FORM_VALIDATORS } from '../../../auth/constants';
import { FormErrorDirective } from '../../../auth/directives/form-error.directive';
import { ErrorMessagePipe } from '../../../auth/pipes/error-message.pipe';
import { hasFieldError, markFormAsTouched } from '../../../auth/utils';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, FormErrorDirective, ErrorMessagePipe],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Theme preference -->
      <fieldset class="space-y-2">
        <legend class="font-bold">Appearance</legend>
        <select formControlName="theme" class="px-4 py-2 border rounded-lg">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </fieldset>

      <!-- Language preference -->
      <fieldset class="space-y-2">
        <legend class="font-bold">Language</legend>
        <select formControlName="language" class="px-4 py-2 border rounded-lg">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </fieldset>

      <!-- Email preference - CON reusable validators -->
      <div>
        <label class="block font-medium mb-2">Notification Email</label>
        <input
          type="email"
          formControlName="notificationEmail"
          appFormError
          [control]="settingsForm.get('notificationEmail')!"
          class="w-full px-4 py-2 border rounded-lg"
        />
        @if (hasError('notificationEmail')) {
          <p class="text-red-500 text-xs mt-1">{{ settingsForm.get('notificationEmail')?.errors | errorMessage }}</p>
        }
      </div>

      <!-- Security: Change password - REUTILIZA TODO -->
      <fieldset class="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
        <legend class="font-bold text-red-900">Security</legend>
        
        <div>
          <label class="block font-medium mb-2">New Password</label>
          <input
            type="password"
            formControlName="newPassword"
            appFormError
            appPasswordStrength
            [control]="settingsForm.get('newPassword')!"
            class="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            formControlName="confirmPassword"
            appFormError
            [control]="settingsForm.get('confirmPassword')!"
            class="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </fieldset>

      @if (error$()) {
        <div class="bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-red-700">
          {{ error$().code | errorMessage }}
        </div>
      }

      <button type="submit" [disabled]="isLoading$()" class="px-6 py-2 bg-primary text-white rounded-lg">
        Save Settings
      </button>
    </form>
  `
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  // ✅ REUTILIZA: Validators + utilities + signals
  settingsForm = this.fb.group({
    theme: ['light'],
    language: ['en'],
    notificationEmail: ['', AUTH_FORM_VALIDATORS.EMAIL],
    newPassword: ['', AUTH_FORM_VALIDATORS.PASSWORD],
    confirmPassword: ['', AUTH_FORM_VALIDATORS.CONFIRM_PASSWORD]
  });

  error$ = signal<IAuthError | null>(null);
  isLoading$ = toSignal(this.settingsService.isLoading$, { initialValue: false });

  hasError = (field: string) => hasFieldError(this.settingsForm, field);

  onSubmit(): void {
    markFormAsTouched(this.settingsForm);
    if (this.settingsForm.valid) {
      this.settingsService.updateSettings(this.settingsForm.value).subscribe({
        next: () => {
          // Success
        },
        error: (err) => {
          this.error$.set(err);
        }
      });
    }
  }
}
```

---

## Summary - Tabla de Reutilización

| Necesidad | Reutiliza | Beneficio |
|-----------|-----------|-----------|
| Validar contraseña | `passwordStrengthValidator` | Consistencia + reutilizable |
| Validar match | `passwordMatchValidator` | Reutilizable en cualquier form |
| Validar email | `AUTH_FORM_VALIDATORS.EMAIL` | Nunca repites reglas |
| Mostrar errores | `ErrorMessagePipe` | Siempre el mismo mapeo |
| Indicador visual | `PasswordStrengthDirective` | Sin código duplicado |
| Manejar errores API | `mapAuthError` | Consistencia en toda la app |
| Limpiar form | `markFormAsTouched` | Reutilizable siempre |
| Detectar errores campo | `hasFieldError` | Lógica centralizada |
| Guardar tokens | `StorageService` | Fácil migrar a secure storage |

---

## Checklist - ¿Estoy usando esto correctamente?

- ✅ ¿Importé validadores de `auth/validators`?
- ✅ ¿Usé `hasFieldError` en lugar de escribir la lógica inline?
- ✅ ¿Pasé errores por `ErrorMessagePipe` para consistencia?
- ✅ ¿Reutilicé `FormErrorDirective` en inputs?
- ✅ ¿Usé `StorageService` en lugar de `localStorage` directo?
- ✅ ¿Apliqué `takeUntilDestroyed()` en subscripciones?
- ✅ ¿Usé `markFormAsTouched` antes de validar?

Si respondiste **SÍ** a todas → **¡Tu código es escalable y mantenible!** 🎯
