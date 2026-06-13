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

  // Pagination state
  readonly pagination = signal<{ skip: number; limit: number; total: number }>({
    skip: 0,
    limit: 10,
    total: 0,
  });

  // Advanced filter state
  readonly filterAuthor = signal<string>('');
  readonly filterDateFrom = signal<string>('');
  readonly filterDateTo = signal<string>('');

  readonly filteredPosts = computed(() => {
    const query = this.search().toLowerCase();
    let posts = this.posts();

    if (query) {
      posts = posts.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          (p.content ?? p.body ?? '').toLowerCase().includes(query)
      );
    }

    const author = this.filterAuthor().toLowerCase();
    if (author) {
      posts = posts.filter(p => p.author.toLowerCase().includes(author));
    }

    if (this.filterDateFrom()) {
      const fromDate = new Date(this.filterDateFrom());
      posts = posts.filter(p => new Date(p.createdAt) >= fromDate);
    }

    if (this.filterDateTo()) {
      const toDate = new Date(this.filterDateTo());
      posts = posts.filter(p => new Date(p.createdAt) <= toDate);
    }

    return posts;
  });

  readonly totalPosts = computed(() => this.pagination().total || this.posts().length);
  readonly filteredCount = computed(() => this.filteredPosts().length);

  readonly totalPages = computed(() => {
    const { limit, total } = this.pagination();
    if (!total) return 1;
    return Math.ceil(total / limit);
  });

  readonly currentPage = computed(() => {
    const { skip, limit } = this.pagination();
    return Math.floor(skip / limit) + 1;
  });

  constructor(private api: ApiService) {}

  private postId(post: Post): string {
    return (post._id ?? post.id) as string;
  }

  loadPosts(skip: number = 0, limit: number = 10): Observable<{ data: Post[] | { items: Post[]; total: number }; message: string }> {
    this.loading.set(true);
    return this.api.get<{ data: Post[] | { items: Post[]; total: number }; message: string }>('/posts', { skip, limit }).pipe(
      delay(300),
      tap(response => {
        const data = response.data;
        if (data && typeof data === 'object' && 'items' in data) {
          this.posts.set((data as { items: Post[]; total: number }).items ?? []);
          this.pagination.set({ skip, limit, total: (data as { items: Post[]; total: number }).total ?? 0 });
        } else {
          this.posts.set((data as Post[]) ?? []);
          this.pagination.set({ skip, limit, total: ((data as Post[]) ?? []).length });
        }
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  nextPage(): void {
    const { skip, limit, total } = this.pagination();
    const nextSkip = skip + limit;
    if (nextSkip < total) {
      this.loadPosts(nextSkip, limit).subscribe();
    }
  }

  prevPage(): void {
    const { skip, limit } = this.pagination();
    const prevSkip = Math.max(0, skip - limit);
    if (prevSkip !== skip) {
      this.loadPosts(prevSkip, limit).subscribe();
    }
  }

  resetFilters(): void {
    this.filterAuthor.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.search.set('');
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
