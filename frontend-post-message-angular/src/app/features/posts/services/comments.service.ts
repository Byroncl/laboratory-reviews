import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Comment, CreateCommentDto } from '../../../shared/models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  readonly comments = signal<Comment[]>([]);
  readonly loading = signal<boolean>(false);

  constructor(private api: ApiService) {}

  private commentId(c: Comment): string {
    return (c._id ?? c.id) as string;
  }

  getCommentsByPost(postId: string): Observable<{ data: Comment[]; message: string }> {
    this.loading.set(true);
    return this.api.get<{ data: Comment[]; message: string }>('/comments', { postId }).pipe(
      tap(response => {
        this.comments.set(response.data ?? []);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  createComment(dto: CreateCommentDto): Observable<{ data: Comment; message: string }> {
    return this.api.post<{ data: Comment; message: string }>('/comments', dto).pipe(
      tap(response => {
        this.comments.set([...this.comments(), response.data]);
      })
    );
  }

  updateComment(id: string, content: string): Observable<{ data: Comment; message: string }> {
    return this.api.put<{ data: Comment; message: string }>(`/comments/${id}`, { content }).pipe(
      tap(response => {
        const index = this.comments().findIndex(c => this.commentId(c) === id);
        if (index !== -1) {
          const updated = [...this.comments()];
          updated[index] = response.data;
          this.comments.set(updated);
        }
      })
    );
  }

  deleteComment(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/comments/${id}`).pipe(
      tap(() => {
        this.comments.set(this.comments().filter(c => this.commentId(c) !== id));
      })
    );
  }

  getReplies(commentId: string): Observable<{ data: Comment[]; message: string }> {
    return this.api.get<{ data: Comment[]; message: string }>(`/comments/${commentId}/replies`);
  }

  createReply(parentCommentId: string, dto: CreateCommentDto): Observable<{ data: Comment; message: string }> {
    return this.api.post<{ data: Comment; message: string }>(`/comments/${parentCommentId}/replies`, dto).pipe(
      tap(response => {
        const reply = response.data;
        const parentIdx = this.comments().findIndex(c => this.commentId(c) === parentCommentId);
        if (parentIdx !== -1) {
          const updated = [...this.comments()];
          const parent = { ...updated[parentIdx] };
          parent.childCommentIds = [...(parent.childCommentIds ?? []), reply._id ?? reply.id ?? ''];
          parent.replies = [...(parent.replies ?? []), reply];
          parent.replyCount = (parent.replyCount ?? 0) + 1;
          updated[parentIdx] = parent;
          this.comments.set(updated);
        }
      })
    );
  }
}
