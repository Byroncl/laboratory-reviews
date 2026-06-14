import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { ClientPostsService } from '../../services/client-posts.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostFormComponent } from '../../components/post-form/post-form.component';
import { SearchFilterComponent, SearchFilters } from '../../../../shared/components/search-filter/search-filter.component';

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [CommonModule, PostCardComponent, PostFormComponent, SearchFilterComponent],
  templateUrl: './my-posts.component.html',
  styleUrl: './my-posts.component.scss',
})
export class MyPostsComponent implements OnInit {
  posts = signal<any[]>([]);
  isLoading = signal(false);
  showForm = false;
  editingPostId = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPosts = signal(0);
  filters = signal<SearchFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

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

  onFilterChange(newFilters: SearchFilters): void {
    this.filters.set(newFilters);
    this.currentPage.set(1);
    this.loadPosts();
  }
}
