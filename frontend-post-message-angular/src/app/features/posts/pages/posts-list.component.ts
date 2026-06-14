import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../services';
import { PostCardComponent, PostFilterComponent, PaginationComponent } from '../components';
import { IPostFilters } from '../interfaces';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PostCardComponent,
    PostFilterComponent,
    PaginationComponent,
  ],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css'],
})
export class PostsListComponent implements OnInit {
  private postsService = inject(PostsService);

  public posts$ = this.postsService.posts$;
  public filteredPosts$ = this.postsService.filteredPosts$;
  public loading$ = this.postsService.isLoadingPosts;
  public error$ = this.postsService.postError;
  public pagination$ = this.postsService.pagination$;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(filters?: IPostFilters): void {
    this.postsService.loadPosts(filters).subscribe({
      error: (err) => console.error('Failed to load posts:', err),
    });
  }

  onFilterChange(filters: IPostFilters): void {
    this.postsService.updateFilters(filters);
  }

  onFilterReset(): void {
    this.postsService.clearFilters();
  }

  onPostView(postId: string): void {
    console.log('View post:', postId);
  }

  onPostEdit(postId: string): void {
    console.log('Edit post:', postId);
  }

  onPostDelete(postId: string): void {
    this.postsService.deletePost(postId).subscribe({
      next: () => console.log('Post deleted'),
      error: (err) => console.error('Failed to delete post:', err),
    });
  }

  onPostPublish(postId: string): void {
    this.postsService.publishPost(postId).subscribe({
      next: () => console.log('Post published'),
      error: (err) => console.error('Failed to publish post:', err),
    });
  }

  onPostArchive(postId: string): void {
    this.postsService.archivePost(postId).subscribe({
      next: () => console.log('Post archived'),
      error: (err) => console.error('Failed to archive post:', err),
    });
  }

  onNextPage(): void {
    this.postsService.nextPage();
    this.loadPosts(this.postsService.getFilters());
  }

  onPrevPage(): void {
    this.postsService.prevPage();
    this.loadPosts(this.postsService.getFilters());
  }
}
