import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from '../services';
import { ICreatePostDTO, IUpdatePostDTO } from '../interfaces';
import { POST_VALIDATION } from '../constants';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css'],
})
export class PostFormComponent implements OnInit {
  private postsService = inject(PostsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  postForm!: FormGroup;
  submitted = false;
  isLoading = signal(false);
  isEditMode = signal(false);
  editPostId = signal<string | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(POST_VALIDATION.TITLE_MIN)]],
      body: ['', [Validators.required, Validators.minLength(POST_VALIDATION.BODY_MIN)]],
      author: ['', [Validators.required, Validators.minLength(POST_VALIDATION.AUTHOR_MIN)]],
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
          body: post.body,
          author: post.author,
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

    if (this.postForm.valid) {
      this.isLoading.set(true);
      const formValue = this.postForm.value;
      const data = {
        title: formValue.title,
        body: formValue.body,
        author: formValue.author,
        tags: formValue.tags
          ? formValue.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [],
      };

      const request = this.isEditMode()
        ? this.postsService.updatePost(this.editPostId()!, data as IUpdatePostDTO)
        : this.postsService.createPost(data as ICreatePostDTO);

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
