// services/posts.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostsService } from './posts.service';
import { IPost } from '../interfaces';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  const mockPosts: IPost[] = [
    {
      _id: '1',
      title: 'Angular Post',
      content: 'Content 1',
      author: 'Alice',
      status: 'published',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    },
    {
      _id: '2',
      title: 'NestJS Post',
      content: 'Content 2',
      author: 'Bob',
      status: 'published',
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    },
  ];

  /**
   * Helper: build the backend envelope shape that adaptPostListResponse expects.
   * { data: { items, skip, limit, total }, statusCode, success, message }
   */
  function backendListFlush(posts: IPost[], total = posts.length, skip = 0, limit = 10) {
    return {
      data: { items: posts, skip, limit, total },
      statusCode: 200,
      success: true,
      message: 'OK',
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostsService],
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load posts and update posts signal', fakeAsync(() => {
    let completed = false;

    service.loadPosts().subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush(backendListFlush(mockPosts));

    expect(completed).toBeTrue();
    expect(service.posts$().length).toBe(2);
    expect(service.posts$()[0].title).toBe('Angular Post');
  }));

  it('should filter posts by text search query', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush(backendListFlush(mockPosts));

    service.updateFilters({ searchTerm: 'Angular' });

    expect(service.filteredPosts$().length).toBe(1);
    expect(service.filteredPosts$()[0].title).toContain('Angular');
  }));

  it('should filter posts by author', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush(backendListFlush(mockPosts));

    service.updateFilters({ author: 'Bob' });

    expect(service.filteredPosts$().length).toBe(1);
    expect(service.filteredPosts$()[0].author).toBe('Bob');
  }));

  it('should clear filters and restore all posts', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush(backendListFlush(mockPosts));

    service.updateFilters({ author: 'Alice' });
    expect(service.filteredPosts$().length).toBe(1);

    service.clearFilters();
    expect(service.filteredPosts$().length).toBe(2);
    expect(service.getFilters()).toEqual({});
  }));

  it('should create a new post and prepend it to the posts signal', fakeAsync(() => {
    // Seed state directly via pagination signal (public on base)
    service.pagination.set({ skip: 0, limit: 10, total: 2 });
    service.items$.set(mockPosts);

    const newPost: IPost = {
      _id: '3',
      title: 'New Post',
      content: 'New Content',
      author: 'Charlie',
      status: 'draft',
      createdAt: new Date('2024-01-03T00:00:00.000Z'),
      updatedAt: new Date('2024-01-03T00:00:00.000Z'),
    };

    let completed = false;
    service.createPost({ title: 'New Post', content: 'New Content' }).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(r => r.url.includes('/posts') && r.method === 'POST');
    req.flush({ data: newPost, message: 'Created' });

    expect(completed).toBeTrue();
    expect(service.posts$().length).toBe(3);
    expect(service.posts$()[0].title).toBe('New Post');
  }));

  it('should delete a post and remove it from the posts signal', fakeAsync(() => {
    service.items$.set([...mockPosts]);
    service.pagination.set({ skip: 0, limit: 10, total: 2 });

    let completed = false;
    service.deletePost('1').subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(r => r.url.includes('/posts/1') && r.method === 'DELETE');
    req.flush({ message: 'Deleted' });

    expect(completed).toBeTrue();
    expect(service.posts$().length).toBe(1);
    expect(service.posts$().find(p => p._id === '1')).toBeUndefined();
  }));

  it('should compute currentPage based on pagination signal', () => {
    service.pagination.set({ skip: 0, limit: 10, total: 30 });
    expect(service.currentPage()).toBe(1);

    service.pagination.set({ skip: 10, limit: 10, total: 30 });
    expect(service.currentPage()).toBe(2);

    service.pagination.set({ skip: 20, limit: 10, total: 30 });
    expect(service.currentPage()).toBe(3);
  });

  it('should compute totalPages based on pagination signal', () => {
    service.pagination.set({ skip: 0, limit: 10, total: 25 });
    expect(service.totalPages()).toBe(3);

    service.pagination.set({ skip: 0, limit: 10, total: 10 });
    expect(service.totalPages()).toBe(1);
  });

  it('should load posts with correct IPostListResponse shape', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush(backendListFlush(mockPosts, 20));

    expect(service.posts$().length).toBe(2);
    expect(service.pagination().total).toBe(20);
    expect(service.totalPages()).toBe(2);
  }));

  // ─── Additional tests ─────────────────────────────────────────────────────

  it('getPost should load a single post and sync it into items$', fakeAsync(() => {
    service.items$.set([...mockPosts]);

    const updatedPost: IPost = { ...mockPosts[0], title: 'Updated Angular Post' };
    service.getPost('1').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts/1') && r.method === 'GET');
    req.flush({ data: updatedPost, message: 'OK' });

    tick();
    const found = service.posts$().find(p => p._id === '1');
    expect(found?.title).toBe('Updated Angular Post');
  }));

  it('publishPost should call updatePost with status published', fakeAsync(() => {
    service.items$.set([...mockPosts]);
    service.pagination.set({ skip: 0, limit: 10, total: 2 });

    const published: IPost = { ...mockPosts[0], status: 'published' };
    service.publishPost('1').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts/1') && r.method === 'PUT');
    expect(req.request.body).toEqual({ status: 'published' });
    req.flush({ data: published, message: 'OK' });
    tick();
  }));

  it('archivePost should call updatePost with status archived', fakeAsync(() => {
    service.items$.set([...mockPosts]);
    service.pagination.set({ skip: 0, limit: 10, total: 2 });

    const archived: IPost = { ...mockPosts[0], status: 'archived' };
    service.archivePost('1').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts/1') && r.method === 'PUT');
    expect(req.request.body).toEqual({ status: 'archived' });
    req.flush({ data: archived, message: 'OK' });
    tick();
  }));

  it('updateFilters should update filter state', fakeAsync(() => {
    service.loadPosts().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush(backendListFlush(mockPosts));

    service.updateFilters({ searchTerm: 'Angular', status: 'published' });

    expect(service.getFilters()).toEqual({ searchTerm: 'Angular', status: 'published' });
    expect(service.filteredPosts$().length).toBe(1);
  }));

  it('_buildLoadParams should append filter params to request URL', fakeAsync(() => {
    service.loadPosts({ searchTerm: 'test', author: 'Alice', status: 'draft' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.get('author')).toBe('Alice');
    expect(req.request.params.get('status')).toBe('draft');
    req.flush(backendListFlush([], 0));
    tick();
  }));

  it('nextPage should advance pagination skip', () => {
    service.pagination.set({ skip: 0, limit: 10, total: 25 });
    service.nextPage();
    expect(service.pagination().skip).toBe(10);
  });

  it('prevPage should decrement pagination skip', () => {
    service.pagination.set({ skip: 10, limit: 10, total: 25 });
    service.prevPage();
    expect(service.pagination().skip).toBe(0);
  });

  it('isLoadingPosts should reflect loading state', fakeAsync(() => {
    service.loadPosts().subscribe();
    expect(service.isLoadingPosts()).toBeTrue();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush(backendListFlush([], 0));
    tick();

    expect(service.isLoadingPosts()).toBeFalse();
  }));

  it('postError should reflect error state on failure', fakeAsync(() => {
    service.loadPosts().subscribe({ error: () => {} });

    // retry(2) = 3 total attempts; flush each one
    for (let i = 0; i < 3; i++) {
      const reqs = httpMock.match(r => r.url.includes('/posts'));
      reqs.forEach(r => r.flush('Error', { status: 500, statusText: 'Server Error' }));
      tick();
    }

    expect(service.postError()).not.toBeNull();
  }));
});
