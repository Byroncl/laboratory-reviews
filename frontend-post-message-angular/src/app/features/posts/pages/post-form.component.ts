import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { PostsService } from '../services/posts.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ErrorAlertComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/dashboard/posts" class="text-gray-500 hover:text-primary text-sm">
          &larr; Back to Posts
        </a>
        <h1 class="text-2xl font-bold text-primary">{{ isEdit ? 'Edit Post' : 'Create Post' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            type="text"
            formControlName="title"
            [attr.data-cy]="'title-input'"
            placeholder="Enter post title"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <p class="text-red-500 text-sm mt-1">Title is required (min 3 characters)</p>
          }
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Content</label>
          <textarea
            formControlName="body"
            [attr.data-cy]="'content-input'"
            placeholder="Enter post content"
            rows="6"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
          ></textarea>
          @if (form.get('body')?.invalid && form.get('body')?.touched) {
            <p class="text-red-500 text-sm mt-1">Content is required (min 10 characters)</p>
          }
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Author</label>
          <input
            type="text"
            formControlName="author"
            [attr.data-cy]="'author-input'"
            placeholder="Enter author name"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
          @if (form.get('author')?.invalid && form.get('author')?.touched) {
            <p class="text-red-500 text-sm mt-1">Author is required</p>
          }
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            [attr.data-cy]="'submit-button'"
            [disabled]="form.invalid || loading()"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm disabled:opacity-50"
          >
            {{ loading() ? 'Saving...' : (isEdit ? 'Update Post' : 'Create Post') }}
          </button>
          <button
            type="button"
            (click)="onCancel()"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
})
export class PostFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postsService = inject(PostsService);
  private readonly notif = inject(NotificationService);

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    body: ['', [Validators.required, Validators.minLength(10)]],
    author: ['', Validators.required],
  });

  isEdit = false;

  get loading() {
    return this.postsService.loading;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.postsService.getPost(id).pipe(
        catchError(err => {
          this.notif.error('Not found', err?.message ?? 'Could not load post');
          return of(null);
        })
      ).subscribe(response => {
        if (response?.data) {
          this.form.patchValue({
            title: response.data.title,
            body: response.data.content ?? response.data.body,
            author: response.data.author,
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const id = this.route.snapshot.paramMap.get('id');
    const data = this.form.value as { title: string; body: string; author: string };

    const request$ = id
      ? this.postsService.updatePost(id, data)
      : this.postsService.createPost(data);

    request$.pipe(
      catchError(err => {
        this.notif.error('Save failed', err?.message ?? 'Could not save post');
        return of(null);
      })
    ).subscribe(() => {
      this.notif.toast(this.isEdit ? 'Post updated' : 'Post created', 'success');
      this.router.navigate(['/dashboard/posts']);
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/posts']);
  }
}
