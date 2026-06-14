import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPost } from '../../interfaces';
import { PostStatusPipe } from '../../pipes/post-status.pipe';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, PostStatusPipe],
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
    if (this.post?.id && confirm('Are you sure you want to delete this post?')) {
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
