import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostsService } from '../../../posts/services/posts.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent, TranslatePipe],
  template: `
    <div class="feed-container">
      <div class="feed-header">
        <h1>{{ 'navigation.feed' | t }}</h1>
        <p class="feed-subtitle">{{ 'feed.description' | t }}</p>
      </div>

      @if (loading()) {
        <div class="loading-skeleton">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      } @else if (posts().length === 0) {
        <div class="empty-state">
          <p>{{ 'feed.empty' | t }}</p>
        </div>
      } @else {
        <div class="posts-grid">
          @for (post of posts(); track post._id) {
            <app-post-card [post]="post" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .feed-container {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }

    .feed-header {
      margin-bottom: 32px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 8px;
      }

      .feed-subtitle {
        color: #64748b;
        font-size: 14px;
        margin: 0;
      }
    }

    .posts-grid {
      display: grid;
      gap: 16px;
    }

    .loading-skeleton {
      display: grid;
      gap: 16px;

      .skeleton-card {
        height: 400px;
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
      }
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;

      p {
        color: #64748b;
        font-size: 16px;
        margin: 0;
      }
    }
  `]
})
export class FeedComponent implements OnInit {
  private postsService = inject(PostsService);

  posts = signal<any[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.loading.set(true);
    this.postsService.loadPosts().subscribe({
      next: (response: any) => {
        const postsData = response?.data || response || [];
        this.posts.set(Array.isArray(postsData) ? postsData : []);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.posts.set([]);
        this.loading.set(false);
      }
    });
  }
}
