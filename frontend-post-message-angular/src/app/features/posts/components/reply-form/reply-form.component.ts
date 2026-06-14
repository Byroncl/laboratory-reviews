import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CommentsService } from '../../services';
import { ICreateCommentDTO } from '../../interfaces';

@Component({
  selector: 'app-reply-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
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

    this.isSubmitting = true;

    const dto: ICreateCommentDTO = {
      content: this.replyForm.value.content,
      post: this.postId,
    };

    this.commentsService.replyToComment(this.parentCommentId, dto).subscribe({
      next: () => {
        this.replyForm.reset();
        this.hasBeenSubmitted = false;
        this.isSubmitting = false;
        this.submitted.emit();
      },
      error: (err) => {
        this.submitError = err?.message ?? 'Failed to submit reply.';
        this.isSubmitting = false;
      },
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
