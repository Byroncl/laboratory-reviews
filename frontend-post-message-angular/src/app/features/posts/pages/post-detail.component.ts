import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostsService, CommentsService } from '../services';
import { CommentFormComponent, PaginationComponent } from '../components';
import { ICreateCommentDTO, IPost } from '../interfaces';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CommentFormComponent, PaginationComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
  private postsService = inject(PostsService);
  private commentsService = inject(CommentsService);
  private route = inject(ActivatedRoute);

  post = signal<IPost | null>(null);
  postLoading = signal(false);
  postError = signal<string | null>(null);

  comments$ = this.commentsService.comments;
  commentsLoading$ = this.commentsService.isLoading;
  commentsHasError$ = this.commentsService.hasError;
  pagination$ = this.commentsService.pagination$;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const postId = params.get('id');
      if (postId) {
        this.loadPost(postId);
        this.loadComments(postId);
      }
    });
  }

  loadPost(id: string): void {
    this.postLoading.set(true);
    this.postsService.getPost(id).subscribe({
      next: (response) => {
        this.post.set(response.data);
        this.postError.set(null);
      },
      error: (err) => {
        this.postError.set('Failed to load post');
        console.error(err);
        this.postLoading.set(false);
      },
      complete: () => this.postLoading.set(false),
    });
  }

  loadComments(postId: string): void {
    this.commentsService.loadCommentsByPost(postId).subscribe({
      error: (err) => console.error('Failed to load comments:', err),
    });
  }

  onCommentSubmit(data: ICreateCommentDTO): void {
    this.commentsService.createComment(data).subscribe({
      next: () => console.log('Comment added'),
      error: (err) => console.error('Failed to add comment:', err),
    });
  }

  onNextPage(): void {
    this.commentsService.nextPage();
    const currentPost = this.post();
    if (currentPost?.id) {
      this.loadComments(currentPost.id);
    }
  }

  onPrevPage(): void {
    this.commentsService.prevPage();
    const currentPost = this.post();
    if (currentPost?.id) {
      this.loadComments(currentPost.id);
    }
  }
}
