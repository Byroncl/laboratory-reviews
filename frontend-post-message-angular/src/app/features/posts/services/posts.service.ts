import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, delay, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Post, CreatePostDto, UpdatePostDto } from '../../../shared/models/post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  readonly posts = signal<Post[]>([]);
  readonly loading = signal<boolean>(false);
  readonly search = signal<string>('');
  readonly selectedPost = signal<Post | null>(null);

  readonly filteredPosts = computed(() => {
    const query = this.search().toLowerCase();
    if (!query) return this.posts();
    return this.posts().filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        (p.content ?? p.body ?? '').toLowerCase().includes(query)
    );
  });

  readonly totalPosts = computed(() => this.posts().length);
  readonly filteredCount = computed(() => this.filteredPosts().length);

  constructor(private api: ApiService) {}

  private postId(post: Post): string {
    return (post._id ?? post.id) as string;
  }

  loadPosts(): Observable<{ data: Post[]; message: string }> {
    this.loading.set(true);
    return this.api.get<{ data: Post[]; message: string }>('/posts').pipe(
      delay(300),
      tap(response => {
        this.posts.set(response.data ?? []);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getPost(id: string): Observable<{ data: Post; message: string }> {
    this.loading.set(true);
    return this.api.get<{ data: Post; message: string }>(`/posts/${id}`).pipe(
      delay(300),
      tap(response => {
        const post = response.data;
        this.selectedPost.set(post);
        const index = this.posts().findIndex(p => this.postId(p) === id);
        if (index !== -1) {
          const updated = [...this.posts()];
          updated[index] = post;
          this.posts.set(updated);
        }
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  createPost(dto: CreatePostDto): Observable<{ data: Post; message: string }> {
    this.loading.set(true);
    return this.api.post<{ data: Post; message: string }>('/posts', dto).pipe(
      tap(response => {
        this.posts.set([response.data, ...this.posts()]);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  updatePost(id: string, dto: UpdatePostDto): Observable<{ data: Post; message: string }> {
    this.loading.set(true);
    return this.api.put<{ data: Post; message: string }>(`/posts/${id}`, dto).pipe(
      tap(response => {
        const updated = response.data;
        const index = this.posts().findIndex(p => this.postId(p) === id);
        if (index !== -1) {
          const posts = [...this.posts()];
          posts[index] = updated;
          this.posts.set(posts);
        }
        const sel = this.selectedPost();
        if (sel && this.postId(sel) === id) {
          this.selectedPost.set(updated);
        }
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  deletePost(id: string): Observable<{ message: string }> {
    this.loading.set(true);
    return this.api.delete<{ message: string }>(`/posts/${id}`).pipe(
      tap(() => {
        this.posts.set(this.posts().filter(p => this.postId(p) !== id));
        const sel = this.selectedPost();
        if (sel && this.postId(sel) === id) {
          this.selectedPost.set(null);
        }
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  setSearch(query: string): void {
    this.search.set(query);
  }
}
