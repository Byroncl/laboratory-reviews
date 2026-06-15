import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CommentsService } from '../../services';
import { AuthService } from '../../../auth/services/auth.service';
import { IComment } from '../../interfaces';
import { getCommentId } from '../../utils/entity-id.util';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { ReplyFormComponent } from '../reply-form/reply-form.component';
import { MEDIA_PREVIEW_LIMIT } from '../../../../shared/constants/media-upload.constants';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, ReactionBarComponent, ReplyFormComponent, CommentItemComponent],
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css'],
})
export class CommentItemComponent {
  @Input() comment!: IComment;
  @Input() postId!: string;
  @Input() postAuthor?: string;
  @Output() replyAdded = new EventEmitter<void>();
  @Output() commentDeleted = new EventEmitter<string>();

  private commentsService = inject(CommentsService);
  private authService = inject(AuthService);

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  readonly currentUser = this.authService.currentUser$;
  readonly isCommentOwner = computed(() => {
    const current = this.currentUser();
    return current && this.comment?.author === current.username;
  });

  readonly showReplyForm = signal(false);
  readonly replies = signal<IComment[]>([]);
  readonly repliesLoading = signal(false);
  readonly showReplies = signal(false);
  readonly isEditing = signal(false);
  readonly editContent = signal('');
  readonly isDeleting = signal(false);

  // Media display state
  readonly showAllMedia = signal(false);

  visibleMedia = computed(() => {
    const media = this.comment?.media ?? [];
    return this.showAllMedia() ? media : media.slice(0, MEDIA_PREVIEW_LIMIT);
  });

  hiddenCount = computed(() => {
    const total = this.comment?.media?.length ?? 0;
    return total > MEDIA_PREVIEW_LIMIT ? total - MEDIA_PREVIEW_LIMIT : 0;
  });

  get commentId(): string {
    return getCommentId(this.comment) ?? '';
  }

  get hasReplies(): boolean {
    return !!(this.comment.replies?.length) || this.replies().length > 0;
  }

  toggleMedia(): void {
    this.showAllMedia.update(v => !v);
  }

  mediaKind(type: string): 'image' | 'video' | 'doc' {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    return 'doc';
  }

  expandReplies(): void {
    if (this.showReplies()) {
      this.showReplies.set(false);
      return;
    }

    const id = this.commentId;
    if (!id) return;

    this.repliesLoading.set(true);
    this.commentsService.getReplies(id).subscribe({
      next: (data) => {
        this.replies.set(data.data);
        this.showReplies.set(true);
        this.repliesLoading.set(false);
      },
      error: () => this.repliesLoading.set(false),
    });
  }

  onReplyAdded(): void {
    this.showReplyForm.set(false);
    this.replyAdded.emit();
    this.showReplies.set(false);
    this.expandReplies();
  }

  startEdit(): void {
    this.editContent.set(this.comment.content);
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editContent.set('');
  }

  saveEdit(): void {
    const newContent = this.editContent().trim();
    if (!newContent) return;

    const commentId = this.commentId;
    if (!commentId) return;

    this.commentsService.updateComment(commentId, { content: newContent }).subscribe({
      next: () => {
        this.comment.content = newContent;
        this.isEditing.set(false);
        this.editContent.set('');
      },
      error: (error) => console.error('Error updating comment:', error),
    });
  }

  deleteComment(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

    const commentId = this.commentId;
    if (!commentId) return;

    this.isDeleting.set(true);
    this.commentsService.deleteComment(commentId).subscribe({
      next: () => {
        this.commentDeleted.emit(commentId);
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.isDeleting.set(false);
      },
    });
  }
}
