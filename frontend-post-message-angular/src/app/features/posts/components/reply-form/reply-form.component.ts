import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CommentsService } from '../../services';
import { ToastService } from '../../../../core/services/toast.service';
import { ICreateCommentDTO } from '../../interfaces';
import { MediaUploadComponent } from '../../../../shared/components/media-upload/media-upload.component';
import { MediaUploadResult } from '../../../../shared/models/media-upload.model';
import { selectAuthUser } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-reply-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe, MediaUploadComponent],
  templateUrl: './reply-form.component.html',
  styleUrls: ['./reply-form.component.css'],
})
export class ReplyFormComponent implements OnInit {
  @Input() postId!: string;
  @Input() parentCommentId!: string;
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private commentsService = inject(CommentsService);
  private toastService = inject(ToastService);
  private store = inject(Store);

  // Media upload state
  readonly mediaResult = signal<MediaUploadResult | null>(null);
  readonly isUploading = signal(false);

  // Reference to MediaUploadComponent child for reset()
  private readonly mediaUpload = viewChild(MediaUploadComponent);

  replyForm!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  hasBeenSubmitted = false;

  ngOnInit(): void {
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit(): void {
    this.hasBeenSubmitted = true;
    this.submitError = null;

    if (!this.postId || !this.parentCommentId) {
      this.submitError = 'Post ID or parent comment ID is missing.';
      return;
    }

    if (this.replyForm.invalid) return;

    this.store.select(selectAuthUser).pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.submitError = 'User information not found.';
        this.toastService.error(this.submitError);
        this.isSubmitting = false;
        return;
      }

      this.isSubmitting = true;

      const m = this.mediaResult();
      const dto: ICreateCommentDTO = {
        content: this.replyForm.value.content,
        postId: this.postId,
        parentCommentId: this.parentCommentId,
        userId: user.id || '',
        author: user.username || '',
        ...(m && m.mediaUrls.length
          ? {
              mediaUrls: m.mediaUrls,
              mediaTypes: m.mediaTypes,
              mediaFilenames: m.mediaFilenames,
            }
          : {}),
      };

      this.commentsService.replyToComment(this.parentCommentId, dto).subscribe({
        next: () => {
          this.replyForm.reset();
          this.hasBeenSubmitted = false;
          this.isSubmitting = false;
          this.mediaResult.set(null);
          this.mediaUpload()?.reset();
          this.toastService.success('Respuesta creada exitosamente');
          this.submitted.emit();
        },
        error: (err) => {
          const errorMsg = err?.message ?? 'Failed to submit reply.';
          this.submitError = errorMsg;
          this.isSubmitting = false;
          this.toastService.error(errorMsg);
        },
      });
    });
  }

  onCancel(): void {
    this.replyForm.reset();
    this.hasBeenSubmitted = false;
    this.submitError = null;
    this.cancelled.emit();
  }

  getFieldError(fieldName: string): string | null {
    const control = this.replyForm.get(fieldName);
    if (!control || !control.errors || !this.hasBeenSubmitted) return null;

    if (control.errors['required']) return 'Reply is required';
    if (control.errors['minlength']) return 'Reply is too short';

    return null;
  }
}
