import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { PostsService } from '../services';
import { ICreatePostDTO, IUpdatePostDTO } from '../interfaces';
import { POST_VALIDATION, POST_STATUSES, STATUS_FILTER_OPTIONS, MAX_TAGS, MAX_TAG_LENGTH } from '../constants';
import { PostStatus } from '../types';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css'],
})
export class PostFormComponent implements OnInit {
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  postForm!: FormGroup;
  submitted = false;
  isLoading = signal(false);
  isEditMode = signal(false);
  editPostId = signal<string | null>(null);
  error = signal<string | null>(null);

  readonly statusOptions = STATUS_FILTER_OPTIONS;

  ngOnInit(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(POST_VALIDATION.TITLE_MIN)]],
      body: ['', [Validators.required, Validators.minLength(POST_VALIDATION.BODY_MIN)]],
      status: [''],
      tags: [''],
    });

    this.route.paramMap.subscribe((params) => {
      const postId = params.get('id');
      if (postId) {
        this.isEditMode.set(true);
        this.editPostId.set(postId);
        this.loadPostForEdit(postId);
      }
    });
  }

  private loadPostForEdit(id: string): void {
    this.isLoading.set(true);
    this.postsService.getPost(id).subscribe({
      next: (response) => {
        const post = response.data;
        this.postForm.patchValue({
          title: post.title,
          body: post.content,
          status: post.status ?? '',
          tags: post.tags?.join(', ') || '',
        });
      },
      error: (err) => {
        this.error.set('Failed to load post');
        console.error(err);
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.postForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const formValue = this.postForm.value;

    const parsedTags: string[] = formValue.tags
      ? formValue.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
          .slice(0, MAX_TAGS)
          .map((t: string) => t.substring(0, MAX_TAG_LENGTH))
      : [];

    const currentUser = this.authService.currentUser$();
    const author = currentUser?.username || 'Anonymous';

    const data: ICreatePostDTO = {
      title: formValue.title,
      content: formValue.body,
      author,
    };

    if (formValue.status) {
      data.status = formValue.status as PostStatus;
    }

    if (parsedTags.length > 0) {
      data.tags = parsedTags;
    }

    const request = this.isEditMode()
      ? this.postsService.updatePost(this.editPostId()!, data as IUpdatePostDTO)
      : this.postsService.createPost(data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        this.error.set('Failed to save post');
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/posts']);
  }

  getFieldError(fieldName: string): string | null {
    const control = this.postForm.get(fieldName);
    if (!control || !control.errors || !this.submitted) return null;

    if (control.errors['required']) return `${fieldName} is required`;
    if (control.errors['minlength']) return `${fieldName} is too short`;

    return null;
  }
}
