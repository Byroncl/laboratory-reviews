import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { IPost } from '../../interfaces';
import { PostStatusPipe } from '../../pipes/post-status.pipe';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PostStatusPipe],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
})
export class PostCardComponent {
  @Input() post!: IPost;
  @Input() isLoading = false;
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() changeStatus = new EventEmitter<{ id: string; status: string }>();

  readonly showStatusModal = signal(false);

  constructor(private i18n: I18nService) {}

  onView(): void {
    const postId = this.post?.id || this.post?._id;
    if (postId) {
      this.view.emit(postId);
    }
  }

  onEdit(): void {
    const postId = this.post?.id || this.post?._id;
    if (postId) {
      this.edit.emit(postId);
    }
  }

  onDelete(): void {
    const postId = this.post?.id || this.post?._id;
    if (postId) {
      this.delete.emit(postId);
    }
  }

  handleStatusSelect(status: string): void {
    const postId = this.post?.id || this.post?._id;
    if (postId) {
      this.changeStatus.emit({ id: postId, status });
      this.showStatusModal.set(false);
    }
  }
}
