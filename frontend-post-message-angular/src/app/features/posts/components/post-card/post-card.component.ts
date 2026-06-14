import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() publish = new EventEmitter<string>();
  @Output() archive = new EventEmitter<string>();

  constructor(private i18n: I18nService) {}

  onView(): void {
    if (this.post?.id) {
      this.view.emit(this.post.id);
    }
  }

  onEdit(): void {
    if (this.post?.id) {
      this.edit.emit(this.post.id);
    }
  }

  onDelete(): void {
    if (this.post?.id && confirm(this.i18n.translate('posts.postCard.deleteConfirm'))) {
      this.delete.emit(this.post.id);
    }
  }

  onPublish(): void {
    if (this.post?.id) {
      this.publish.emit(this.post.id);
    }
  }

  onArchive(): void {
    if (this.post?.id) {
      this.archive.emit(this.post.id);
    }
  }
}
