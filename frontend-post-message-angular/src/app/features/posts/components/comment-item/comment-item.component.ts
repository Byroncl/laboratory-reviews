import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, TranslatePipe, ReactionBarComponent, ReplyFormComponent, CommentItemComponent],
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css'],
})
export class CommentItemComponent {
  @Input() comment!: IComment;
  @Input() postId!: string;
  @Input() postAuthor?: string;
  @Output() replyAdded = new EventEmitter<void>();

  private commentsService = inject(CommentsService);
  private authService = inject(AuthService);

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  readonly showReplyForm = signal(false);
  readonly replies = signal<IComment[]>([]);
  readonly repliesLoading = signal(false);
  readonly showReplies = signal(false);

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
    // Reload replies to reflect the new one
    this.showReplies.set(false);
    this.expandReplies();
  }
}
