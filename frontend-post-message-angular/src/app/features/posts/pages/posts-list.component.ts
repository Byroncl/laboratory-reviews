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
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm whitespace-nowrap"
        >
          + New Post
        </a>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search posts..."
          [value]="searchQuery"
          (input)="onSearchChange($event)"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />
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
            <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h2 class="text-xl font-semibold text-primary mb-1 truncate">{{ post.title }}</h2>
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
                    class="text-sm text-blue-600 hover:underline"
                  >View</a>
                  <a
                    [routerLink]="[post._id ?? post.id, 'edit']"
                    class="text-sm text-green-600 hover:underline"
                  >Edit</a>
                  <button
                    (click)="deletePost(post._id ?? post.id)"
                    class="text-sm text-red-600 hover:underline text-left"
                  >Delete</button>
                </div>
              </div>
            </div>
          }
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
  readonly loading = this.postsService.loading;
  readonly filteredPosts = this.postsService.filteredPosts;
  readonly totalPosts = this.postsService.totalPosts;
  readonly filteredCount = this.postsService.filteredCount;

  ngOnInit(): void {
    this.postsService.loadPosts().pipe(
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
