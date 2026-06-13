import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';
import { UsersService } from '../../admin/services/users.service';
import { User } from '../../../shared/models/user.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Name Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nombre
          <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          formControlName="name"
          placeholder="Ej: Juan"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('name')"
        />
        @if (isFieldInvalid('name')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('name') }}</p>
        }
      </div>

      <!-- Last Name Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Apellido
          <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          formControlName="lastname"
          placeholder="Ej: Pérez"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('lastname')"
        />
        @if (isFieldInvalid('lastname')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('lastname') }}</p>
        }
      </div>

      <!-- Username Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Usuario
          <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          formControlName="username"
          placeholder="Ej: juan.perez"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('username')"
        />
        @if (isFieldInvalid('username')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('username') }}</p>
        }
      </div>

      <!-- Email Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email
          <span class="text-red-500">*</span>
        </label>
        <input
          type="email"
          formControlName="email"
          placeholder="Ej: juan@example.com"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('email')"
        />
        @if (isFieldInvalid('email')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('email') }}</p>
        }
      </div>

      <!-- Password Field (only for create mode) -->
      @if (!editingUserId) {
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
            <span class="text-red-500">*</span>
          </label>
          <input
            type="password"
            formControlName="password_hash"
            placeholder="Mínimo 6 caracteres"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            [class.border-red-500]="isFieldInvalid('password_hash')"
          />
          @if (isFieldInvalid('password_hash')) {
            <p class="mt-1 text-sm text-red-500">{{ getFieldError('password_hash') }}</p>
          }
        </div>
      }

      <!-- Type Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Usuario
          <span class="text-red-500">*</span>
        </label>
        <select
          formControlName="type"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('type')"
        >
          <option value="">Seleccionar tipo...</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        @if (isFieldInvalid('type')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('type') }}</p>
        }
      </div>

      <!-- Form Actions -->
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          [disabled]="form.invalid || isLoading"
          class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          @if (isLoading) {
            <app-spinner size="sm" />
          }
          {{ editingUserId ? 'Actualizar Usuario' : 'Crear Usuario' }}
        </button>
        <button
          type="button"
          (click)="onCancel()"
          [disabled]="isLoading"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
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
    private notificationService: NotificationService
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

    if (field.hasError('required')) return 'Este campo es requerido';
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    if (field.hasError('email')) return 'Email inválido';

    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.toast('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    this.isLoading = true;

    if (this.editingUserId) {
      this.usersService.updateUser(this.editingUserId, this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast('Usuario actualizado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al actualizar usuario',
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
            this.notificationService.toast('Usuario creado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al crear usuario',
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
