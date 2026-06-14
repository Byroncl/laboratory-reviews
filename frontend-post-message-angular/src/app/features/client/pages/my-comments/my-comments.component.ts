import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { ClientCommentsService } from '../../services/client-comments.service';
import { CommentCardComponent } from '../../components/comment-card/comment-card.component';

@Component({
  selector: 'app-my-comments',
  standalone: true,
  imports: [CommonModule, CommentCardComponent],
  templateUrl: './my-comments.component.html',
  styleUrl: './my-comments.component.scss',
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
