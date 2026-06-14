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
      body: 'Content 1',
      author: 'Alice',
      status: 'published',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    },
    {
      _id: '2',
      title: 'NestJS Post',
      body: 'Content 2',
      author: 'Bob',
      status: 'published',
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    },
  ];

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
    req.flush({
      data: mockPosts,
      pagination: { skip: 0, limit: 10, total: 2 },
      message: 'OK',
    });

    expect(completed).toBeTrue();
    expect(service.posts$().length).toBe(2);
    expect(service.posts$()[0].title).toBe('Angular Post');
  }));

  it('should filter posts by text search query', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({
      data: mockPosts,
      pagination: { skip: 0, limit: 10, total: 2 },
      message: 'OK',
    });

    service.updateFilters({ searchTerm: 'Angular' });

    expect(service.filteredPosts$().length).toBe(1);
    expect(service.filteredPosts$()[0].title).toContain('Angular');
  }));

  it('should filter posts by author', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({
      data: mockPosts,
      pagination: { skip: 0, limit: 10, total: 2 },
      message: 'OK',
    });

    service.updateFilters({ author: 'Bob' });

    expect(service.filteredPosts$().length).toBe(1);
    expect(service.filteredPosts$()[0].author).toBe('Bob');
  }));

  it('should clear filters and restore all posts', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({
      data: mockPosts,
      pagination: { skip: 0, limit: 10, total: 2 },
      message: 'OK',
    });

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
      body: 'New Content',
      author: 'Charlie',
      status: 'draft',
      createdAt: new Date('2024-01-03T00:00:00.000Z'),
      updatedAt: new Date('2024-01-03T00:00:00.000Z'),
    };

    let completed = false;
    service.createPost({ title: 'New Post', body: 'New Content', author: 'Charlie' }).subscribe(() => {
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
    req.flush({
      data: mockPosts,
      pagination: { skip: 0, limit: 10, total: 20 },
      message: 'OK',
    });

    expect(service.posts$().length).toBe(2);
    expect(service.pagination().total).toBe(20);
    expect(service.totalPages()).toBe(2);
  }));
});
