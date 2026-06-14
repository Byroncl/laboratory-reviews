import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentsService } from '../../services';
import { ICreateCommentDTO } from '../../interfaces';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css'],
})
export class CommentFormComponent implements OnInit {
  /** The ID of the post this comment belongs to. Required. */
  @Input() postId!: string;
  /** When true the form is hidden and a sign-in prompt is shown instead. */
  @Input() disabled = false;

  @Output() submitted = new EventEmitter<ICreateCommentDTO>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private commentsService = inject(CommentsService);

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

    const dto: ICreateCommentDTO = {
      content: this.commentForm.value.content,
      post: this.postId,
    };

    this.isSubmitting = true;

    this.commentsService.createComment(dto).subscribe({
      next: () => {
        this.commentForm.reset();
        this.hasBeenSubmitted = false;
        this.isSubmitting = false;
        this.submitted.emit(dto);
      },
      error: (err) => {
        this.submitError = err?.message ?? 'Failed to submit comment.';
        this.isSubmitting = false;
      },
    });
  }

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
