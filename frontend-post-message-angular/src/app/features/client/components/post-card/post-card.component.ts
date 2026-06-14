import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="post-card">
      <div class="post-header">
        <div class="post-info">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-author">Por: {{ post.author }}</p>
          <p class="post-date">{{ post.createdAt | date: 'short' }}</p>
        </div>
        <div class="post-image" *ngIf="post.imageUrl">
          <img [src]="post.imageUrl" [alt]="post.title" />
        </div>
      </div>

      <div class="post-body">
        <p>{{ post.body.substring(0, 150) }}...</p>
      </div>

      <div class="post-footer">
        <div class="post-meta">
          <span class="category" *ngIf="post.categoryName">
            {{ post.categoryName }}
          </span>
        </div>
        <div class="post-actions">
          <button class="btn btn-small btn-primary" (click)="onView()">Ver</button>
          <button class="btn btn-small btn-warning" (click)="onEdit()" *ngIf="showEditDelete">
            Editar
          </button>
          <button class="btn btn-small btn-danger" (click)="onDelete()" *ngIf="showEditDelete">
            Eliminar
          </button>
          <button
            class="btn btn-small"
            [class.btn-favorite]="isFavorite"
            (click)="onToggleFavorite()"
            *ngIf="showFavorite"
          >
            {{ isFavorite ? '❤️' : '🤍' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .post-card {
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        transition: box-shadow 0.3s;
      }

      .post-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .post-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .post-info {
        flex: 1;
      }

      .post-title {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #333;
        font-weight: 600;
      }

      .post-author,
      .post-date {
        margin: 0;
        font-size: 12px;
        color: #666;
      }

      .post-date {
        margin-top: 4px;
      }

      .post-image {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        overflow: hidden;
        margin-left: 12px;
      }

      .post-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .post-body {
        margin-bottom: 12px;
        color: #555;
        line-height: 1.5;
      }

      .post-body p {
        margin: 0;
      }

      .post-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .post-meta {
        display: flex;
        gap: 8px;
      }

      .category {
        display: inline-block;
        background-color: #e9ecef;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #495057;
      }

      .post-actions {
        display: flex;
        gap: 8px;
      }

      .btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .btn-small {
        padding: 4px 8px;
        font-size: 11px;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background-color: #0056b3;
      }

      .btn-warning {
        background-color: #ffc107;
        color: #333;
      }

      .btn-warning:hover {
        background-color: #e0a800;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background-color: #c82333;
      }

      .btn-favorite {
        background-color: transparent;
        font-size: 16px;
      }

      .btn-favorite:hover {
        transform: scale(1.2);
      }
    `,
  ],
})
export class PostCardComponent {
  @Input() post: any;
  @Input() showEditDelete = false;
  @Input() showFavorite = false;
  @Input() isFavorite = false;

  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleFavorite = new EventEmitter<string>();

  onView(): void {
    this.view.emit(this.post._id);
  }

  onEdit(): void {
    this.edit.emit(this.post._id);
  }

  onDelete(): void {
    this.delete.emit(this.post._id);
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.post._id);
  }
}
