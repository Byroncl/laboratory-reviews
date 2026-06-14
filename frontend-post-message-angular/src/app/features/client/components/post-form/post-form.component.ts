import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="title">Título</label>
        <input
          id="title"
          type="text"
          formControlName="title"
          placeholder="Ingresa el título del post"
          class="form-control"
        />
        <div class="error-message" *ngIf="form.get('title')?.invalid && form.get('title')?.touched">
          El título debe tener al menos 3 caracteres
        </div>
      </div>

      <div class="form-group">
        <label for="body">Contenido</label>
        <textarea
          id="body"
          formControlName="body"
          placeholder="Ingresa el contenido del post"
          class="form-control"
          rows="6"
        ></textarea>
        <div class="error-message" *ngIf="form.get('body')?.invalid && form.get('body')?.touched">
          El contenido debe tener al menos 10 caracteres
        </div>
      </div>

      <div class="form-group">
        <label for="categoryId">Categoría (opcional)</label>
        <input
          id="categoryId"
          type="text"
          formControlName="categoryId"
          placeholder="ID de la categoría"
          class="form-control"
        />
      </div>

      <div class="button-group">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting">
          {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }} Post
        </button>
        <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
    </form>
  `,
  styles: [
    `
      form {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      .form-group {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
      }

      label {
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
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

      .error-message {
        color: #dc3545;
        font-size: 12px;
        margin-top: 4px;
      }

      .button-group {
        display: flex;
        gap: 10px;
        margin-top: 20px;
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

      .btn-primary:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #545b62;
      }
    `,
  ],
})
export class PostFormComponent implements OnInit {
  @Input() initialData: any = null;
  @Input() isEditing = false;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: [''],
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.formSubmitted.emit(this.form.value);
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  setSubmitting(value: boolean): void {
    this.isSubmitting = value;
  }

  setError(error: string): void {
    this.errorMessage = error;
    this.isSubmitting = false;
  }
}
