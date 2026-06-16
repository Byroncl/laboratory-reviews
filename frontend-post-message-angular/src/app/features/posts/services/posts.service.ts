import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  IPost,
  ICreatePostDTO,
  IUpdatePostDTO,
  IPostListResponse,
  IPostResponse,
  IPostFilters,
} from '../interfaces';
import { POSTS_API_ENDPOINTS } from '../constants';
import { applyPostFilters } from '../utils';
import { PostsBaseService } from './posts-base.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService extends PostsBaseService<IPost> {
  protected override baseUrl = environment.apiUrl;

  // Semantic public computed aliases over inherited protected signals
  public readonly posts$ = computed(() => this.items$());
  public readonly isLoadingPosts = computed(() => this.loading$());
  public readonly postError = computed(() => this.error$());
  public readonly pagination$ = computed(() => this.pagination());

  // Filter state
  private readonly filters = signal<IPostFilters>({});

  // Client-side filtered view (composition of server results + local filters)
  public readonly filteredPosts$ = computed(() =>
    applyPostFilters(this.items$(), this.filters()),
  );

  constructor() {
    super(inject(HttpClient));
  }

  /**
   * Load posts with optional filters
   */
  public loadPosts(filters?: IPostFilters): Observable<IPostListResponse> {
    if (filters) {
      this.filters.set(filters);
    }
    return this.loadItems(filters);
  }

  /**
   * Create a new post
   */
  public createPost(data: ICreatePostDTO): Observable<IPostResponse> {
    return this.createItem(data);
  }

  /**
   * Update an existing post
   */
  public updatePost(id: string, data: IUpdatePostDTO): Observable<IPostResponse> {
    return this.updateItem(id, data);
  }

  /**
   * Delete a post
   */
  public deletePost(id: string): Observable<any> {
    return this.deleteItem(id);
  }

  /**
   * Get a single post by ID and sync it into the list state
   */
  public getPost(id: string): Observable<IPostResponse> {
    this.loading$.set(true);
    this.error$.set(null);

    return this.http
      .get<IPostResponse>(`${this.baseUrl}${POSTS_API_ENDPOINTS.DETAIL.replace(':id', id)}`)
      .pipe(
        tap((response) => {
          const updatedId = this._getId(response.data);
          if (updatedId) {
            const updatedItems = this.items$().map((item) =>
              this._getId(item) === updatedId ? response.data : item,
            );
            this.items$.set(updatedItems);
          }
          this.error$.set(null);
        }),
        catchError((err) => this._handleError(err, 'Failed to load post')),
        finalize(() => this.loading$.set(false)),
      );
  }

  /**
   * Publish a post (change status to published)
   */
  public publishPost(id: string): Observable<IPostResponse> {
    return this.updatePost(id, { status: 'published' });
  }

  /**
   * Archive a post (change status to archived)
   */
  public archivePost(id: string): Observable<IPostResponse> {
    return this.updatePost(id, { status: 'archived' });
  }

  /**
   * Update the active filter state without triggering a reload
   */
  public updateFilters(filters: IPostFilters): void {
    this.filters.set(filters);
  }

  /**
   * Get a snapshot of the current filters
   */
  public getFilters(): IPostFilters {
    return this.filters();
  }

  /**
   * Clear all active filters
   */
  public clearFilters(): void {
    this.filters.set({});
  }

  /**
   * Change post status via PATCH endpoint
   */
  public changePostStatus(id: string, status: 'draft' | 'published' | 'archived'): Observable<IPostResponse> {
    return this.updatePostStatus(id, status);
  }

  /**
   * Bulk create posts from array
   */
  public override bulkCreatePosts(posts: any[]): Observable<any> {
    return super.bulkCreatePosts(posts);
  }

  /**
   * Get current user's posts
   */
  public getMyPosts(pagination?: { skip?: number; limit?: number }): Observable<IPostListResponse> {
    let params = new HttpParams();
    if (pagination?.skip !== undefined) {
      params = params.set('skip', pagination.skip.toString());
    }
    if (pagination?.limit !== undefined) {
      params = params.set('limit', pagination.limit.toString());
    }

    return this.http
      .get<any>(`${this.baseUrl}/posts/my-posts`, { params })
      .pipe(
        tap((response) => this._handleLoadSuccess(response)),
        catchError((err) => this._handleError(err, 'Failed to load my posts')),
      ) as Observable<IPostListResponse>;
  }

  /**
   * Override base to append filter params to API query string
   */
  protected override _buildLoadParams(filters?: IPostFilters): Record<string, unknown> {
    const params = super._buildLoadParams(filters);

    if (filters?.searchTerm) {
      params['search'] = filters.searchTerm;
    }
    if (filters?.author) {
      params['author'] = filters.author;
    }
    if (filters?.status) {
      params['status'] = filters.status;
    }
    if (filters?.dateFrom) {
      params['dateFrom'] = filters.dateFrom.toISOString();
    }
    if (filters?.dateTo) {
      params['dateTo'] = filters.dateTo.toISOString();
    }
    if (filters?.tags && filters.tags.length > 0) {
      params['tags'] = filters.tags.join(',');
    }
    if (filters?.categoryId) {
      params['categoryId'] = filters.categoryId;
    }
    if (filters?.limit !== undefined) {
      params['limit'] = filters.limit;
    }
    if (filters?.skip !== undefined) {
      params['skip'] = filters.skip;
    }

    return params;
  }

  /**
   * Upload image file
   */
  public uploadImage(formData: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/files/upload`, formData)
      .pipe(
        catchError((err) => this._handleError(err, 'Failed to upload image')),
      );
  }
}
