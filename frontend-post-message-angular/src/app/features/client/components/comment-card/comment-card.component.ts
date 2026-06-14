import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comment-card.component.html',
  styleUrl: './comment-card.component.scss',
})
export class CommentCardComponent {
  @Input() comment: any;
  @Input() showDelete = true;
  @Input() postId: string = '';

  @Output() delete = new EventEmitter<string>();
  @Output() viewPost = new EventEmitter<string>();

  onDelete(): void {
    this.delete.emit(this.comment._id);
  }

  onViewPost(event: Event): void {
    event.preventDefault();
    this.viewPost.emit(this.postId);
  }
}
