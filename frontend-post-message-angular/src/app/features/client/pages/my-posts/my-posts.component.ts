import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { ClientPostsService } from '../../services/client-posts.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostFormComponent } from '../../components/post-form/post-form.component';

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [CommonModule, PostCardComponent, PostFormComponent],
  template: `
    <div class="my-posts">
      <div class="header">
        <h2>Mis Posts</h2>
        <button class="btn btn-primary" (click)="toggleCreateForm()">
          {{ showForm ? 'Cancelar' : '+ Nuevo Post' }}
        </button>
      </div>

      <div class="form-section" *ngIf="showForm">
        <app-post-form
          [isEditing]="editingPostId() !== null"
          [initialData]="currentEditingPost()"
          (formSubmitted)="onFormSubmitted($event)"
          (formCancelled)="onFormCancelled()"
          #postForm
        ></app-post-form>
      </div>

      <div class="loading" *ngIf="isLoading()">
        Cargando tus posts...
      </div>

      <div class="empty-state" *ngIf="!isLoading() && posts().length === 0">
        <p>No tienes posts aún</p>
      </div>

      <div class="posts-list" *ngIf="!isLoading() && posts().length > 0">
        <app-post-card
          *ngFor="let post of posts()"
          [post]="post"
          [showEditDelete]="true"
          (edit)="onEditPost($event)"
          (delete)="onDeletePost($event)"
        ></app-post-card>
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
      .my-posts {
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

      .btn {
        padding: 10px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background-color: #0056b3;
      }

      .btn-small {
        padding: 6px 12px;
        font-size: 12px;
      }

      .form-section {
        margin-bottom: 24px;
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
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

      .posts-list {
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

      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    `,
  ],
})
export class MyPostsComponent implements OnInit {
  posts = signal<any[]>([]);
  isLoading = signal(false);
  showForm = false;
  editingPostId = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPosts = signal(0);

  currentEditingPost = computed(() => {
    const postId = this.editingPostId();
    if (!postId) return null;
    return this.posts().find(p => p._id === postId);
  });

  totalPages = computed(() => Math.ceil(this.totalPosts() / this.pageSize()));

  constructor(private postsService: ClientPostsService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.postsService.getMyPosts(this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        this.posts.set(response.data?.data || []);
        this.totalPosts.set(response.data?.total || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleCreateForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingPostId.set(null);
    }
  }

  onFormSubmitted(data: any): void {
    const postId = this.editingPostId();

    if (postId) {
      this.postsService.updatePost(postId, data).subscribe({
        next: () => {
          this.loadPosts();
          this.showForm = false;
          this.editingPostId.set(null);
        },
      });
    } else {
      this.postsService.createPost(data).subscribe({
        next: () => {
          this.loadPosts();
          this.showForm = false;
        },
      });
    }
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.editingPostId.set(null);
  }

  onEditPost(postId: string): void {
    this.editingPostId.set(postId);
    this.showForm = true;
  }

  onDeletePost(postId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este post?')) {
      this.postsService.deletePost(postId).subscribe({
        next: () => {
          this.loadPosts();
        },
      });
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadPosts();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadPosts();
    }
  }
}
