import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostsService } from './posts.service';
import { ApiService } from '../../../core/services/api.service';
import { Post } from '../../../shared/models/post.model';
import { environment } from '../../../../environments/environment';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  const mockPosts: Post[] = [
    {
      _id: '1',
      title: 'Angular Post',
      content: 'Content 1',
      author: 'Alice',
      userId: 'u1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      _id: '2',
      title: 'NestJS Post',
      content: 'Content 2',
      author: 'Bob',
      userId: 'u2',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostsService, ApiService],
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
    req.flush({ data: mockPosts, message: 'OK' });

    tick(300); // bypass delay(300)

    expect(completed).toBeTrue();
    expect(service.posts().length).toBe(2);
    expect(service.posts()[0].title).toBe('Angular Post');
  }));

  it('should filter posts by text search query', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: mockPosts, message: 'OK' });
    tick(300);

    service.setSearch('Angular');

    expect(service.filteredPosts().length).toBe(1);
    expect(service.filteredPosts()[0].title).toContain('Angular');
  }));

  it('should filter posts by author', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: mockPosts, message: 'OK' });
    tick(300);

    service.filterAuthor.set('Bob');

    expect(service.filteredPosts().length).toBe(1);
    expect(service.filteredPosts()[0].author).toBe('Bob');
  }));

  it('should reset filters', fakeAsync(() => {
    service.loadPosts().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: mockPosts, message: 'OK' });
    tick(300);

    service.filterAuthor.set('Alice');
    expect(service.filteredPosts().length).toBe(1);

    service.resetFilters();
    expect(service.filteredPosts().length).toBe(2);
    expect(service.search()).toBe('');
    expect(service.filterAuthor()).toBe('');
  }));

  it('should create a new post and prepend it to the posts signal', fakeAsync(() => {
    service.posts.set(mockPosts);

    const newPost: Post = {
      _id: '3',
      title: 'New Post',
      content: 'New Content',
      author: 'Charlie',
      userId: 'u3',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    };

    let completed = false;
    service.createPost({ title: 'New Post', body: 'New Content', author: 'Charlie' }).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(r => r.url.includes('/posts') && r.method === 'POST');
    req.flush({ data: newPost, message: 'Created' });

    expect(completed).toBeTrue();
    expect(service.posts().length).toBe(3);
    expect(service.posts()[0].title).toBe('New Post');
  }));

  it('should delete a post and remove it from the posts signal', fakeAsync(() => {
    service.posts.set([...mockPosts]);

    let completed = false;
    service.deletePost('1').subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(r => r.url.includes('/posts/1') && r.method === 'DELETE');
    req.flush({ message: 'Deleted' });

    expect(completed).toBeTrue();
    expect(service.posts().length).toBe(1);
    expect(service.posts().find(p => p._id === '1')).toBeUndefined();
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

  it('should handle paginated response shape { items, total }', fakeAsync(() => {
    service.loadPosts(0, 10).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: { items: mockPosts, total: 20 }, message: 'OK' });
    tick(300);

    expect(service.posts().length).toBe(2);
    expect(service.pagination().total).toBe(20);
    expect(service.totalPages()).toBe(2);
  }));
});
