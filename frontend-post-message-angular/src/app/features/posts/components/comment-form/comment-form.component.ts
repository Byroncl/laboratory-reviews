import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICreateCommentDTO } from '../../interfaces';
import { COMMENT_VALIDATION } from '../../constants';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css'],
})
export class CommentFormComponent implements OnInit {
  @Input() postId!: string;
  @Input() isLoading = false;
  @Input() placeholder = 'Add a comment...';
  @Output() submit = new EventEmitter<ICreateCommentDTO>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  commentForm!: FormGroup;
  submitted = false;

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(COMMENT_VALIDATION.NAME_MIN)]],
      email: ['', [Validators.required, Validators.email]],
      body: ['', [Validators.required, Validators.minLength(COMMENT_VALIDATION.BODY_MIN)]],
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.commentForm.valid) {
      const commentData: ICreateCommentDTO = {
        postId: this.postId,
        ...this.commentForm.value,
      };
      this.submit.emit(commentData);
      this.commentForm.reset();
      this.submitted = false;
    }
  }

  onCancel(): void {
    this.commentForm.reset();
    this.submitted = false;
    this.cancel.emit();
  }

  getFieldError(fieldName: string): string | null {
    const control = this.commentForm.get(fieldName);
    if (!control || !control.errors || !this.submitted) return null;

    if (control.errors['required']) return `${fieldName} is required`;
    if (control.errors['minlength']) return `${fieldName} is too short`;
    if (control.errors['email']) return 'Invalid email address';

    return null;
  }
}
