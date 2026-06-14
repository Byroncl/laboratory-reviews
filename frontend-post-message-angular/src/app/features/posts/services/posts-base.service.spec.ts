// services/posts-base.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PostsBaseService } from './posts-base.service';
import { IPost, IPostListResponse, IPostResponse, IPostFilters } from '../interfaces';

// Concrete subclass to test the abstract base
@Injectable()
class TestPostsService extends PostsBaseService<IPost> {
  public override baseUrl = 'http://localhost:3000/api';

  constructor(http: HttpClient) {
    super(http);
  }

  public loadItemsPublic(filters?: IPostFilters): Observable<IPostListResponse> {
    return this.loadItems(filters);
  }

  public createItemPublic(data: Partial<IPost>): Observable<IPostResponse> {
    return this.createItem(data);
  }

  public updateItemPublic(id: string, data: Partial<IPost>): Observable<IPostResponse> {
    return this.updateItem(id, data);
  }

  public deleteItemPublic(id: string): Observable<any> {
    return this.deleteItem(id);
  }

  public getIdPublic(entity: IPost | null | undefined): string | null {
    return this._getId(entity);
  }

  public buildLoadParamsPublic(filters?: IPostFilters): Record<string, unknown> {
    return this._buildLoadParams(filters);
  }
}

const mockPost: IPost = {
  _id: 'post-1',
  title: 'Test Post',
  content: 'Test content here',
  author: 'Alice',
  status: 'published',
};

const mockPost2: IPost = {
  _id: 'post-2',
  title: 'Second Post',
  content: 'More content here',
  author: 'Bob',
  status: 'draft',
};

describe('PostsBaseService (via TestPostsService)', () => {
  let service: TestPostsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TestPostsService],
    });

    service = TestBed.inject(TestPostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set loading$ to true during request and false after', fakeAsync(() => {
    let loadingDuringRequest = false;

    service.loadItemsPublic().subscribe(() => {
      loadingDuringRequest = service.isLoading();
    });

    expect(service.isLoading()).toBeTrue();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({
      data: [mockPost],
      pagination: { skip: 0, limit: 10, total: 1 },
      message: 'OK',
    });

    tick();
    expect(service.isLoading()).toBeFalse();
  }));

  it('should update items$ and pagination on successful load', fakeAsync(() => {
    service.loadItemsPublic().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({
      data: [mockPost, mockPost2],
      pagination: { skip: 0, limit: 10, total: 2 },
      message: 'OK',
    });

    tick();
    expect(service.items$().length).toBe(2);
    expect(service.pagination().total).toBe(2);
  }));

  it('should set error$ on HTTP error', fakeAsync(() => {
    let errorThrown = false;

    service.loadItemsPublic().subscribe({
      error: () => { errorThrown = true; },
    });

    const reqs = httpMock.match(r => r.url.includes('/posts'));
    reqs.forEach(r => r.flush('Server Error', { status: 500, statusText: 'Internal Server Error' }));

    tick();
    expect(service.hasError()).toBeTrue();
    expect(errorThrown).toBeTrue();
  }));

  it('should prepend new item and increment total on createItem success', fakeAsync(() => {
    service.items$.set([mockPost2]);
    service.pagination.set({ skip: 0, limit: 10, total: 1 });

    service.createItemPublic({ title: 'New', content: 'Content', status: 'draft' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts') && r.method === 'POST');
    req.flush({ data: mockPost, message: 'Created' });

    tick();
    expect(service.items$().length).toBe(2);
    expect(service.items$()[0]._id).toBe('post-1');
    expect(service.pagination().total).toBe(2);
  }));

  it('should replace existing item in items$ on updateItem success', fakeAsync(() => {
    service.items$.set([mockPost, mockPost2]);

    const updated: IPost = { ...mockPost, title: 'Updated Title' };
    service.updateItemPublic('post-1', { title: 'Updated Title' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts/post-1') && r.method === 'PUT');
    req.flush({ data: updated, message: 'Updated' });

    tick();
    const found = service.items$().find(p => p._id === 'post-1');
    expect(found?.title).toBe('Updated Title');
    expect(service.items$().length).toBe(2);
  }));

  it('should remove item from items$ and decrement total on deleteItem success', fakeAsync(() => {
    service.items$.set([mockPost, mockPost2]);
    service.pagination.set({ skip: 0, limit: 10, total: 2 });

    service.deleteItemPublic('post-1').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/posts/post-1') && r.method === 'DELETE');
    req.flush({ message: 'Deleted' });

    tick();
    expect(service.items$().length).toBe(1);
    expect(service.items$().find(p => p._id === 'post-1')).toBeUndefined();
    expect(service.pagination().total).toBe(1);
  }));

  it('should advance skip when canGoToNextPage is true', () => {
    service.pagination.set({ skip: 0, limit: 10, total: 25 });
    service.nextPage();
    expect(service.pagination().skip).toBe(10);
  });

  it('should do nothing when nextPage is called on last page', () => {
    service.pagination.set({ skip: 20, limit: 10, total: 25 });
    service.nextPage();
    expect(service.pagination().skip).toBe(20);
  });

  it('should decrement skip when canGoToPreviousPage is true', () => {
    service.pagination.set({ skip: 10, limit: 10, total: 25 });
    service.prevPage();
    expect(service.pagination().skip).toBe(0);
  });

  it('should do nothing when prevPage is called on first page', () => {
    service.pagination.set({ skip: 0, limit: 10, total: 25 });
    service.prevPage();
    expect(service.pagination().skip).toBe(0);
  });

  it('should reset pagination to skip=0 on resetPagination', () => {
    service.pagination.set({ skip: 20, limit: 10, total: 50 });
    service.resetPagination(10);
    expect(service.pagination().skip).toBe(0);
    expect(service.pagination().total).toBe(0);
  });

  it('should empty items$ and reset pagination on clearItems', () => {
    service.items$.set([mockPost, mockPost2]);
    service.pagination.set({ skip: 10, limit: 10, total: 20 });
    service.clearItems();
    expect(service.items$().length).toBe(0);
    expect(service.pagination().skip).toBe(0);
    expect(service.pagination().total).toBe(0);
  });

  it('should return _id preferring it over id', () => {
    const post: IPost = { _id: 'from-_id', id: 'from-id', title: 'T', content: 'B', author: 'A', status: 'draft' };
    expect(service.getIdPublic(post)).toBe('from-_id');
  });

  it('should return null from _getId when entity is null', () => {
    expect(service.getIdPublic(null)).toBeNull();
  });

  it('_buildLoadParams returns skip and limit from current pagination', () => {
    service.pagination.set({ skip: 20, limit: 5, total: 100 });
    const params = service.buildLoadParamsPublic();
    expect(params['skip']).toBe(20);
    expect(params['limit']).toBe(5);
  });
});
