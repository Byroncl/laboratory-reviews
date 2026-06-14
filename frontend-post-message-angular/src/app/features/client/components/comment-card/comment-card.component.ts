import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comment-card">
      <div class="comment-header">
        <div class="comment-author">
          <strong>{{ comment.name }}</strong>
          <p class="comment-email">{{ comment.email }}</p>
        </div>
        <p class="comment-date">{{ comment.createdAt | date: 'short' }}</p>
      </div>

      <div class="comment-body">
        <p>{{ comment.body }}</p>
      </div>

      <div class="comment-footer">
        <button class="btn btn-small btn-danger" (click)="onDelete()" *ngIf="showDelete">
          Eliminar
        </button>
        <a href="#" class="link" *ngIf="postId" (click)="onViewPost($event)">
          Ver post
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .comment-card {
        background: #f8f9fa;
        border-left: 3px solid #007bff;
        padding: 12px;
        margin-bottom: 12px;
        border-radius: 4px;
      }

      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .comment-author {
        flex: 1;
      }

      .comment-author strong {
        color: #333;
      }

      .comment-email {
        margin: 0;
        font-size: 12px;
        color: #666;
      }

      .comment-date {
        margin: 0;
        font-size: 12px;
        color: #999;
      }

      .comment-body {
        margin-bottom: 8px;
        color: #555;
        line-height: 1.5;
      }

      .comment-body p {
        margin: 0;
      }

      .comment-footer {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .btn {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
      }

      .btn-small {
        padding: 4px 8px;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background-color: #c82333;
      }

      .link {
        color: #007bff;
        text-decoration: none;
        font-size: 12px;
      }

      .link:hover {
        text-decoration: underline;
      }
    `,
  ],
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
