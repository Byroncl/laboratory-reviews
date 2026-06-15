// services/comments.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CommentsService } from './comments.service';
import { IComment, ICreateCommentDTO, ICommentListResponse } from '../interfaces';

const BASE_URL = 'http://localhost:3000/api';

const mockComment: IComment = {
  _id: 'c1',
  post: 'post-123',
  content: 'Great post!',
};

const mockComment2: IComment = {
  _id: 'c2',
  post: 'post-123',
  content: 'Another comment',
};

const mockListResponse: ICommentListResponse = {
  data: [mockComment, mockComment2],
  pagination: { skip: 0, limit: 5, total: 2 },
  message: 'OK',
};

describe('CommentsService', () => {
  let service: CommentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentsService],
    });

    service = TestBed.inject(CommentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadComments(postId)', () => {
    it('should send postId as query param', fakeAsync(() => {
      service.loadComments('post-123').subscribe();

      const req = httpMock.expectOne((r) =>
        r.url.includes('/comments') && r.params.get('postId') === 'post-123',
      );
      expect(req.request.method).toBe('GET');

      req.flush(mockListResponse);
      tick();
    }));

    it('should update comments signal after successful load', fakeAsync(() => {
      service.loadComments('post-123').subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/comments'));
      req.flush(mockListResponse);
      tick();

      expect(service.comments().length).toBe(2);
      expect(service.comments()[0]._id).toBe('c1');
    }));

    it('should update pagination signal after successful load', fakeAsync(() => {
      service.loadComments('post-123').subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/comments'));
      req.flush(mockListResponse);
      tick();

      expect(service.pagination$().total).toBe(2);
      expect(service.pagination$().skip).toBe(0);
    }));

    it('should set hasError to true on HTTP error', fakeAsync(() => {
      service.loadComments('post-123').subscribe({ error: () => {} });

      // retry(2) = 3 total attempts; flush each one
      for (let i = 0; i < 3; i++) {
        const reqs = httpMock.match((r) => r.url.includes('/comments'));
        reqs.forEach((r) => r.flush('Error', { status: 500, statusText: 'Internal Server Error' }));
        tick();
      }

      expect(service.hasError()).toBeTrue();
    }));
  });

  describe('loadCommentsByPost()', () => {
    it('should be an alias for loadComments and include postId param', fakeAsync(() => {
      service.loadCommentsByPost('post-abc').subscribe();

      const req = httpMock.expectOne((r) =>
        r.url.includes('/comments') && r.params.get('postId') === 'post-abc',
      );
      req.flush({ data: [], pagination: { skip: 0, limit: 5, total: 0 }, message: 'OK' });
      tick();
    }));
  });

  describe('getCommentsByPostId()', () => {
    it('should unwrap comments array from response', fakeAsync(() => {
      let result: IComment[] | undefined;
      service.getCommentsByPostId('post-123').subscribe((data) => { result = data; });

      const req = httpMock.expectOne((r) => r.url.includes('/comments'));
      req.flush(mockListResponse);
      tick();

      expect(result).toBeDefined();
      expect(result!.length).toBe(2);
      expect(result![0]._id).toBe('c1');
    }));
  });

  describe('createComment()', () => {
    it('should POST with content and post fields (ICreateCommentDTO)', fakeAsync(() => {
      const dto: ICreateCommentDTO = {
        content: 'New comment',
        post: 'post-123',
      };

      service.createComment(dto).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url.includes('/comments') && r.method === 'POST',
      );
      expect(req.request.body).toEqual(dto);
      expect(req.request.body.content).toBe('New comment');
      expect(req.request.body.post).toBe('post-123');
      // Must not have postId, name, email, or body fields
      expect(req.request.body.postId).toBeUndefined();
      expect(req.request.body.body).toBeUndefined();

      req.flush({
        statusCode: 201,
        success: true,
        message: 'Created',
        data: mockComment,
      });
      tick();
    }));

    it('should prepend new comment to comments signal after create', fakeAsync(() => {
      service['comments$'].set([mockComment2]);

      const dto: ICreateCommentDTO = { content: 'New!', post: 'post-123' };
      service.createComment(dto).subscribe();

      const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.includes('/comments'));
      req.flush({ statusCode: 201, success: true, message: 'Created', data: mockComment });
      tick();

      expect(service.comments().length).toBe(2);
      expect(service.comments()[0]._id).toBe('c1');
    }));
  });

  describe('nextPage() and prevPage()', () => {
    it('should advance skip on nextPage when more pages exist', () => {
      service['pagination'].set({ skip: 0, limit: 5, total: 10 });
      service.nextPage();
      expect(service.pagination$().skip).toBe(5);
    });

    it('should not advance skip on nextPage when on last page', () => {
      service['pagination'].set({ skip: 5, limit: 5, total: 10 });
      service.nextPage();
      expect(service.pagination$().skip).toBe(5);
    });

    it('should decrement skip on prevPage when not on first page', () => {
      service['pagination'].set({ skip: 5, limit: 5, total: 10 });
      service.prevPage();
      expect(service.pagination$().skip).toBe(0);
    });

    it('should not decrement skip on prevPage when on first page', () => {
      service['pagination'].set({ skip: 0, limit: 5, total: 10 });
      service.prevPage();
      expect(service.pagination$().skip).toBe(0);
    });
  });
});
