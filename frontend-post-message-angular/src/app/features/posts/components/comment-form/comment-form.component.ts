import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CommentsService } from '../../services';
import { ICreateCommentDTO } from '../../interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { selectAuthUser } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css'],
})
export class CommentFormComponent implements OnInit {
  /** The ID of the post this comment belongs to. Required. */
  @Input() postId!: string;

  @Output() submitted = new EventEmitter<ICreateCommentDTO>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private commentsService = inject(CommentsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private store = inject(Store);

  readonly showAuthModal = signal(false);
  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  commentForm!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  hasBeenSubmitted = false;

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit(): void {
    this.hasBeenSubmitted = true;
    this.submitError = null;

    if (!this.postId) {
      this.submitError = 'Post ID is missing. Cannot submit comment.';
      return;
    }

    if (this.commentForm.invalid) {
      return;
    }

    this.store.select(selectAuthUser).pipe(take(1)).subscribe((user) => {

      if (!user) {
        this.submitError = 'User information not found.';
        this.toastService.error(this.submitError);
        this.isSubmitting = false;
        return;
      }

      const dto: ICreateCommentDTO = {
        content: this.commentForm.value.content,
        postId: this.postId,
        userId: user.id || '',
        author: user.username || '',
      };

      this.isSubmitting = true;

      this.commentsService.createComment(dto).subscribe({
        next: () => {
          this.commentForm.reset();
          this.hasBeenSubmitted = false;
          this.isSubmitting = false;
          this.toastService.success('Comentario creado exitosamente');
          this.submitted.emit(dto);
        },
        error: (err) => {
          const errorMsg = err?.message ?? 'Failed to submit comment.';
          this.submitError = errorMsg;
          this.isSubmitting = false;
          this.toastService.error(errorMsg);
        },
      });
    });
  }

  goToLogin(): void { this.router.navigate(['/auth/login']); }
  goToRegister(): void { this.router.navigate(['/auth/register']); }
  closeAuthModal(): void { this.showAuthModal.set(false); }

  onCancel(): void {
    this.commentForm.reset();
    this.hasBeenSubmitted = false;
    this.submitError = null;
    this.cancel.emit();
  }

  getFieldError(fieldName: string): string | null {
    const control = this.commentForm.get(fieldName);
    if (!control || !control.errors || !this.hasBeenSubmitted) return null;

    if (control.errors['required']) return `Comment is required`;
    if (control.errors['minlength']) return `Comment is too short`;

    return null;
  }
}
