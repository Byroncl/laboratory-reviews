import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { ClientCommentsService } from '../../services/client-comments.service';
import { CommentCardComponent } from '../../components/comment-card/comment-card.component';

@Component({
  selector: 'app-my-comments',
  standalone: true,
  imports: [CommonModule, CommentCardComponent],
  template: `
    <div class="my-comments">
      <div class="header">
        <h2>Mis Comentarios</h2>
        <span class="count">{{ comments().length }} comentario(s)</span>
      </div>

      <div class="loading" *ngIf="isLoading()">
        Cargando tus comentarios...
      </div>

      <div class="empty-state" *ngIf="!isLoading() && comments().length === 0">
        <p>No has hecho comentarios aún</p>
      </div>

      <div class="comments-list" *ngIf="!isLoading() && comments().length > 0">
        <app-comment-card
          *ngFor="let comment of comments()"
          [comment]="comment"
          [showDelete]="true"
          [postId]="comment.postId"
          (delete)="onDeleteComment($event)"
        ></app-comment-card>
      </div>

      <div class="pagination" *ngIf="totalPages() > 1">
        <button
          class="btn btn-small"
          [disabled]="currentPage() === 1"
          (click)="previousPage()"
        >
          Anterior
        </button>
        <span class="page-info">
          Página {{ currentPage() }} de {{ totalPages() }}
        </span>
        <button
          class="btn btn-small"
          [disabled]="currentPage() === totalPages()"
          (click)="nextPage()"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .my-comments {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
      }

      .count {
        background-color: #e9ecef;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        color: #495057;
      }

      .loading {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }

      .comments-list {
        margin-bottom: 24px;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 24px;
      }

      .page-info {
        color: #666;
        font-size: 14px;
      }

      .btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        background-color: #007bff;
        color: white;
      }

      .btn:hover:not(:disabled) {
        background-color: #0056b3;
      }

      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .btn-small {
        padding: 6px 12px;
      }
    `,
  ],
})
export class MyCommentsComponent implements OnInit {
  comments = signal<any[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  totalComments = signal(0);

  totalPages = computed(() => Math.ceil(this.totalComments() / this.pageSize()));

  constructor(private commentsService: ClientCommentsService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading.set(true);
    this.commentsService.getMyComments(this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        this.comments.set(response.data?.data || []);
        this.totalComments.set(response.data?.total || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onDeleteComment(commentId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      this.commentsService.deleteComment(commentId).subscribe({
        next: () => {
          this.loadComments();
        },
      });
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadComments();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadComments();
    }
  }
}
