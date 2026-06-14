import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';
import { PostsService } from '../../posts/services/posts.service';
import { Post } from '../../../shared/models/post.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Title Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Título
          <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          formControlName="title"
          placeholder="Ej: Mi primer post"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('title')"
        />
        @if (isFieldInvalid('title')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('title') }}</p>
        }
      </div>

      <!-- Content Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Contenido
          <span class="text-red-500">*</span>
        </label>
        <textarea
          formControlName="content"
          placeholder="Escribe el contenido del post..."
          rows="8"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
          [class.border-red-500]="isFieldInvalid('content')"
        ></textarea>
        @if (isFieldInvalid('content')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('content') }}</p>
        }
        <p class="mt-1 text-xs text-gray-500">
          {{ form.get('content')?.value?.length ?? 0 }} / 5000 caracteres
        </p>
      </div>

      <!-- Image URL Field (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          URL de Imagen (Opcional)
        </label>
        <input
          type="url"
          formControlName="imageUrl"
          placeholder="Ej: http://localhost:9000/posts/image.jpg"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('imageUrl')"
        />
        @if (isFieldInvalid('imageUrl')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('imageUrl') }}</p>
        }
      </div>

      <!-- Image Filename Field (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nombre de archivo de imagen (Opcional)
        </label>
        <input
          type="text"
          formControlName="imageFilename"
          placeholder="Ej: 1718000000000-photo.jpg"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('imageFilename')"
        />
        @if (isFieldInvalid('imageFilename')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('imageFilename') }}</p>
        }
      </div>

      <!-- Category ID Field (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          ID de Categoría (Opcional)
        </label>
        <input
          type="text"
          formControlName="categoryId"
          placeholder="Ej: 507f1f77bcf86cd799439011"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Category Name Field (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nombre de Categoría (Opcional)
        </label>
        <input
          type="text"
          formControlName="categoryName"
          placeholder="Ej: Backend"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          [class.border-red-500]="isFieldInvalid('categoryName')"
        />
        @if (isFieldInvalid('categoryName')) {
          <p class="mt-1 text-sm text-red-500">{{ getFieldError('categoryName') }}</p>
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
          {{ editingPostId ? 'Actualizar Post' : 'Crear Post' }}
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
export class PostFormComponent implements OnInit, OnDestroy {
  @Input() editingPostId: string | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  form!: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private postsService: PostsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.editingPostId) {
      this.loadPostData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200)
        ]
      ],
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(5000)
        ]
      ],
      imageUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      imageFilename: ['', [Validators.maxLength(500)]],
      categoryId: [''],
      categoryName: ['', [Validators.maxLength(100)]]
    });
  }

  private loadPostData(): void {
    const posts = this.postsService.posts();
    const post = posts.find(p => (p._id ?? p.id) === this.editingPostId);
    if (post) {
      this.form.patchValue({
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl || '',
        imageFilename: post.imageFilename || '',
        categoryId: post.categoryId || '',
        categoryName: post.categoryName || ''
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
    if (field.hasError('pattern')) return 'URL debe comenzar con http:// o https://';

    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.notificationService.toast('Por favor complete los campos requeridos', 'error');
      return;
    }

    this.isLoading = true;

    if (this.editingPostId) {
      this.postsService.updatePost(this.editingPostId, this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast('Post actualizado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al actualizar post',
              'error'
            );
          }
        });
    } else {
      this.postsService.createPost(this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.toast('Post creado correctamente', 'success');
            this.formSubmitted.emit();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.toast(
              error?.message || 'Error al crear post',
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
