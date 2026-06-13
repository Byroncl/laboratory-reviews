import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { PostsService } from '../services/posts.service';
import { CommentsService } from '../services/comments.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSkeletonComponent,
    ErrorAlertComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/dashboard/posts" class="text-gray-500 hover:text-primary text-sm">
          &larr; Back to Posts
        </a>
      </div>

      @if (loading()) {
        <app-loading-skeleton [count]="3" />
      }

      @if (!loading() && post()) {
        <div class="bg-white rounded-lg shadow p-6">
          <h1 [attr.data-cy]="'post-title'" class="text-3xl font-bold text-primary mb-2">{{ post()?.title }}</h1>
          <p class="text-sm text-gray-500 mb-4">
            By <strong>{{ post()?.author }}</strong> &bull; {{ post()?.createdAt | date: 'medium' }}
          </p>
          <div class="prose max-w-none text-gray-700 whitespace-pre-line">
            {{ post()?.content ?? post()?.body }}
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">Comments ({{ comments().length }})</h2>

          <form [formGroup]="commentForm" (ngSubmit)="submitComment()" class="mb-6">
            <textarea
              formControlName="content"
              [attr.data-cy]="'comment-textarea'"
              placeholder="Write a comment..."
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
            ></textarea>
            @if (commentForm.get('content')?.invalid && commentForm.get('content')?.touched) {
              <p class="text-red-500 text-sm mt-1">Content is required (min 3 characters)</p>
            }
            <button
              type="submit"
              [attr.data-cy]="'post-comment-button'"
              [disabled]="commentForm.invalid || submitting()"
              class="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm disabled:opacity-50"
            >
              {{ submitting() ? 'Posting...' : 'Post Comment' }}
            </button>
          </form>

          @if (commentsLoading()) {
            <app-loading-skeleton [count]="3" />
          } @else {
            <div class="space-y-4">
              @for (comment of comments(); track comment._id ?? comment.id) {
                <div [attr.data-cy]="'comment-item'" class="border border-gray-200 rounded-lg p-4 group relative">
                  <div class="flex justify-between items-start mb-2">
                    <strong class="text-sm text-primary">{{ comment.userId }}</strong>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-400">{{ comment.createdAt | date: 'short' }}</span>
                      <!-- Edit/Delete actions (visible on hover) -->
                      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          (click)="editComment(comment._id ?? comment.id)"
                          [attr.data-cy]="'edit-comment-button'"
                          class="text-blue-500 hover:text-blue-700 text-sm px-1"
                          title="Edit comment"
                        >&#9998;</button>
                        <button
                          (click)="deleteComment(comment._id ?? comment.id)"
                          [attr.data-cy]="'delete-comment-button'"
                          class="text-red-500 hover:text-red-700 text-sm px-1"
                          title="Delete comment"
                        >&#128465;</button>
                      </div>
                    </div>
                  </div>

                  <!-- Inline edit mode -->
                  @if (editingCommentId() === (comment._id ?? comment.id)) {
                    <div class="mt-2">
                      <textarea
                        [(ngModel)]="editingContent"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                      ></textarea>
                      <div class="flex gap-2 mt-2">
                        <button
                          (click)="saveEditedComment(comment._id ?? comment.id)"
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        >Save</button>
                        <button
                          (click)="cancelEdit()"
                          class="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
                        >Cancel</button>
                      </div>
                    </div>
                  } @else {
                    <p class="text-gray-700 text-sm mb-3">{{ comment.content }}</p>

                    @if (comment.media && comment.media.length > 0) {
                      <div class="mb-3 space-y-2">
                        @for (media of comment.media; track media.url) {
                          @if (isImage(media.type)) {
                            <img [src]="media.url" [alt]="media.filename" class="max-h-48 rounded-lg" />
                          }
                          @if (isAudio(media.type)) {
                            <audio [src]="media.url" controls class="w-full"></audio>
                          }
                        }
                      </div>
                    }

                    <button
                      (click)="toggleReply(comment._id ?? comment.id)"
                      [attr.data-cy]="'reply-button'"
                      class="text-xs text-blue-600 hover:underline"
                    >
                      Reply
                    </button>
                  }

                  @if (replyingTo() === (comment._id ?? comment.id)) {
                    <div class="mt-3 pl-4 border-l-2 border-blue-300">
                      <textarea
                        [(ngModel)]="replyContent"
                        [attr.data-cy]="'reply-textarea'"
                        placeholder="Write a reply..."
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                      ></textarea>
                      <div class="flex gap-2 mt-2">
                        <button
                          (click)="submitReply(comment._id ?? comment.id)"
                          [attr.data-cy]="'post-reply-button'"
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        >Post Reply</button>
                        <button
                          (click)="cancelReply()"
                          class="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
                        >Cancel</button>
                      </div>
                    </div>
                  }

                  @if (comment.replies && comment.replies.length > 0) {
                    <div class="mt-4 pl-4 space-y-2 border-l-2 border-gray-100">
                      @for (reply of comment.replies; track reply._id ?? reply.id) {
                        <div [attr.data-cy]="'reply-item'" class="bg-gray-50 p-3 rounded-lg">
                          <div class="flex justify-between items-start mb-1">
                            <strong class="text-xs text-primary">{{ reply.userId }}</strong>
                            <span class="text-xs text-gray-400">{{ reply.createdAt | date: 'short' }}</span>
                          </div>
                          <p class="text-sm text-gray-700">{{ reply.content }}</p>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PostDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);
  private readonly notif = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  get post() {
    return this.postsService.selectedPost;
  }
  get loading() {
    return this.postsService.loading;
  }
  get comments() {
    return this.commentsService.comments;
  }
  get commentsLoading() {
    return this.commentsService.loading;
  }

  readonly submitting = signal(false);
  readonly replyingTo = signal<string | undefined>(undefined);
  readonly editingCommentId = signal<string | null>(null);
  replyContent = '';
  editingContent = '';

  readonly commentForm: FormGroup = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => this.postsService.getPost(params['id']).pipe(
        catchError(err => {
          this.notif.error('Not found', err?.message ?? 'Could not load post');
          return of(null);
        })
      ))
    ).subscribe(response => {
      if (response?.data) {
        const postId = response.data._id ?? response.data.id;
        if (postId) this.loadComments(postId);
      }
    });
  }

  private loadComments(postId: string): void {
    this.commentsService.getCommentsByPost(postId).pipe(
      catchError(err => {
        this.notif.error('Error', err?.message ?? 'Could not load comments');
        return of(null);
      })
    ).subscribe();
  }

  submitComment(): void {
    if (this.commentForm.invalid) return;
    const postId = this.post()?._id ?? this.post()?.id;
    if (!postId) return;

    this.submitting.set(true);
    this.commentsService.createComment({
      content: this.commentForm.get('content')!.value as string,
      postId,
    }).pipe(
      catchError(err => {
        this.notif.error('Error', err?.message ?? 'Could not post comment');
        return of(null);
      })
    ).subscribe(() => {
      this.commentForm.reset();
      this.submitting.set(false);
      this.notif.toast('Comment posted', 'success');
    });
  }

  toggleReply(id: string | undefined): void {
    this.replyingTo.set(this.replyingTo() === id ? undefined : id);
    this.replyContent = '';
  }

  cancelReply(): void {
    this.replyingTo.set(undefined);
    this.replyContent = '';
  }

  submitReply(commentId: string | undefined): void {
    if (!commentId || !this.replyContent.trim()) return;
    const postId = this.post()?._id ?? this.post()?.id;
    if (!postId) return;

    this.commentsService.createReply(commentId, {
      content: this.replyContent,
      postId,
      parentCommentId: commentId,
    }).pipe(
      catchError(err => {
        this.notif.error('Error', err?.message ?? 'Could not post reply');
        return of(null);
      })
    ).subscribe(() => {
      this.replyContent = '';
      this.replyingTo.set(undefined);
      this.notif.toast('Reply posted', 'success');
    });
  }

  editComment(id: string | undefined): void {
    if (!id) return;
    const comment = this.comments().find(c => (c._id ?? c.id) === id);
    if (comment) {
      this.editingCommentId.set(id);
      this.editingContent = comment.content;
    }
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editingContent = '';
  }

  saveEditedComment(id: string | undefined): void {
    if (!id || !this.editingContent.trim()) return;

    this.commentsService.updateComment(id, this.editingContent).pipe(
      catchError(err => {
        this.notif.error('Error', err?.message ?? 'Could not update comment');
        return of(null);
      })
    ).subscribe(() => {
      this.cancelEdit();
      this.notif.toast('Comment updated', 'success');
    });
  }

  deleteComment(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Delete this comment?')) return;

    this.commentsService.deleteComment(id).pipe(
      catchError(err => {
        this.notif.error('Error', err?.message ?? 'Could not delete comment');
        return of(null);
      })
    ).subscribe(() => {
      this.notif.toast('Comment deleted', 'success');
    });
  }

  isImage(type: string): boolean {
    return type.startsWith('image/');
  }

  isAudio(type: string): boolean {
    return type.startsWith('audio/');
  }
}
