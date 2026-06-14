import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CommentsService } from '../../services';
import { IComment } from '../../interfaces';
import { getCommentId } from '../../utils/entity-id.util';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { ReplyFormComponent } from '../reply-form/reply-form.component';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ReactionBarComponent, ReplyFormComponent],
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css'],
})
export class CommentItemComponent {
  @Input() comment!: IComment;
  @Input() postId!: string;
  @Output() replyAdded = new EventEmitter<void>();

  private commentsService = inject(CommentsService);

  readonly showReplyForm = signal(false);
  readonly replies = signal<IComment[]>([]);
  readonly repliesLoading = signal(false);
  readonly showReplies = signal(false);

  get commentId(): string {
    return getCommentId(this.comment) ?? '';
  }

  get hasReplies(): boolean {
    return !!(this.comment.replies?.length) || this.replies().length > 0;
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
