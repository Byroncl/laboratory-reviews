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
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss'
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
