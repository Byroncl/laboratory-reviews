import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PostsService } from '../services/posts.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 class="text-3xl font-bold text-primary">Posts</h1>
        <a
          routerLink="create"
          [attr.data-cy]="'new-post-button'"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm whitespace-nowrap"
        >
          + New Post
        </a>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          [attr.data-cy]="'search-input'"
          placeholder="Search posts..."
          [value]="searchQuery"
          (input)="onSearchChange($event)"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Advanced Filters -->
      <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">By Author</label>
            <input
              type="text"
              [attr.data-cy]="'author-filter'"
              placeholder="Filter by author..."
              [value]="authorFilter"
              (input)="onAuthorFilterChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">By Status</label>
            <select
              [attr.data-cy]="'status-filter'"
              [value]="statusFilter"
              (change)="onStatusFilterChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              [attr.data-cy]="'date-from-filter'"
              [value]="dateFromFilter"
              (input)="onDateFromChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              [attr.data-cy]="'date-to-filter'"
              [value]="dateToFilter"
              (input)="onDateToChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <button
          (click)="resetFilters()"
          class="mt-3 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
        >
          Clear Filters
        </button>
      </div>

      @if (loading()) {
        <app-loading-skeleton [count]="5" />
      } @else if (filteredPosts().length === 0) {
        <app-empty-state
          title="No posts found"
          message="Try adjusting your search or create a new post"
          icon="📄"
        />
      } @else {
        <div class="space-y-4">
          @for (post of filteredPosts(); track post._id ?? post.id) {
            <div [attr.data-cy]="'post-card'" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h2 [attr.data-cy]="'post-title'" class="text-xl font-semibold text-primary mb-1 truncate">{{ post.title }}</h2>
                  <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                    {{ (post.content ?? post.body ?? '') | slice: 0:160 }}
                  </p>
                  <span class="text-xs text-gray-400">
                    By {{ post.author }} &bull; {{ post.createdAt | date: 'mediumDate' }}
                  </span>
                </div>
                <div class="flex flex-col gap-2 shrink-0">
                  <a
                    [routerLink]="[post._id ?? post.id]"
                    [attr.data-cy]="'view-button'"
                    class="text-sm text-blue-600 hover:underline"
                  >View</a>
                  <a
                    [routerLink]="[post._id ?? post.id, 'edit']"
                    class="text-sm text-green-600 hover:underline"
                  >Edit</a>
                  <button
                    (click)="deletePost(post._id ?? post.id)"
                    [attr.data-cy]="'delete-button'"
                    class="text-sm text-red-600 hover:underline text-left"
                  >Delete</button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Pagination -->
      @if (!loading() && filteredPosts().length > 0) {
        <div class="flex justify-center items-center gap-4 mt-6">
          <button
            (click)="onPrevPage()"
            [disabled]="currentPage() === 1 || loading()"
            [attr.data-cy]="'prev-button'"
            class="px-4 py-2 bg-primary hover:bg-black disabled:bg-gray-300 text-white rounded transition"
          >
            &larr; Previous
          </button>
          <span [attr.data-cy]="'current-page'" class="text-gray-600">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
          <button
            (click)="onNextPage()"
            [disabled]="currentPage() >= totalPages() || loading()"
            [attr.data-cy]="'next-button'"
            class="px-4 py-2 bg-primary hover:bg-black disabled:bg-gray-300 text-white rounded transition"
          >
            Next &rarr;
          </button>
        </div>
      }

      <p class="text-sm text-gray-500 text-center">
        Showing {{ filteredCount() }} of {{ totalPosts() }} posts
      </p>
    </div>
  `,
})
export class PostsListComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly notif = inject(NotificationService);

  searchQuery = '';
  authorFilter = '';
  statusFilter = '';
  dateFromFilter = '';
  dateToFilter = '';

  readonly loading = this.postsService.loading;
  readonly filteredPosts = this.postsService.filteredPosts;
  readonly totalPosts = this.postsService.totalPosts;
  readonly filteredCount = this.postsService.filteredCount;
  readonly currentPage = this.postsService.currentPage;
  readonly totalPages = this.postsService.totalPages;

  ngOnInit(): void {
    this.postsService.loadPosts(0, 10).pipe(
      catchError(err => {
        this.notif.error('Load failed', err?.message ?? 'Could not load posts');
        return of(null);
      })
    ).subscribe();
  }

  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.postsService.setSearch(this.searchQuery);
  }

  onAuthorFilterChange(event: Event): void {
    this.authorFilter = (event.target as HTMLInputElement).value;
    this.postsService.filterAuthor.set(this.authorFilter);
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.postsService.loadPosts(0, 10, {
      author: this.authorFilter || undefined,
      status: this.statusFilter || undefined
    }).subscribe();
  }

  onDateFromChange(event: Event): void {
    this.dateFromFilter = (event.target as HTMLInputElement).value;
    this.postsService.filterDateFrom.set(this.dateFromFilter);
  }

  onDateToChange(event: Event): void {
    this.dateToFilter = (event.target as HTMLInputElement).value;
    this.postsService.filterDateTo.set(this.dateToFilter);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.authorFilter = '';
    this.statusFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.postsService.resetFilters();
    this.postsService.loadPosts(0, 10).subscribe();
  }

  onNextPage(): void {
    this.postsService.nextPage();
  }

  onPrevPage(): void {
    this.postsService.prevPage();
  }

  deletePost(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.postsService.deletePost(id).pipe(
      catchError(err => {
        this.notif.error('Delete failed', err?.message ?? 'Could not delete post');
        return of(null);
      })
    ).subscribe(() => {
      this.notif.toast('Post deleted', 'success');
    });
  }
}
