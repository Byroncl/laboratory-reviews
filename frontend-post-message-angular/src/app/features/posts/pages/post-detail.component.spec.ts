// pages/post-detail.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';
import { ParamMap, convertToParamMap } from '@angular/router';

import { PostDetailComponent } from './post-detail.component';
import { PostsService } from '../services/posts.service';
import { CommentsService } from '../services/comments.service';
import { IPost, IComment, IPagination, ICreateCommentDTO } from '../interfaces';

const mockPost: IPost = {
  _id: 'p1',
  id: 'p1',
  title: 'Hello World',
  body: 'Post body content',
  author: 'Alice',
  status: 'published',
};

const mockComment: IComment = {
  _id: 'c1',
  postId: 'p1',
  name: 'Reviewer',
  email: 'rev@example.com',
  body: 'Great post!',
};

class MockPostsService {
  getPost = jasmine.createSpy('getPost').and.returnValue(of({ data: mockPost, message: 'ok' }));
}

class MockCommentsService {
  private _comments = signal<IComment[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _pagination = signal<IPagination>({ skip: 0, limit: 5, total: 0 });

  comments = computed(() => this._comments());
  isLoading = computed(() => this._loading());
  hasError = computed(() => this._error() !== null);
  errorMessage = computed(() => this._error());
  pagination$ = computed(() => this._pagination());
  totalPages = computed(() => 0);
  currentPage = computed(() => 1);
  filteredComments = computed(() => this._comments());

  loadCommentsByPost = jasmine.createSpy('loadCommentsByPost').and.returnValue(
    of({ data: [], pagination: { skip: 0, limit: 5, total: 0 }, message: 'ok' }),
  );
  createComment = jasmine.createSpy('createComment').and.returnValue(
    of({ data: mockComment, message: 'ok' }),
  );
  nextPage = jasmine.createSpy('nextPage');
  prevPage = jasmine.createSpy('prevPage');
}

describe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;
  let postsService: MockPostsService;
  let commentsService: MockCommentsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailComponent],
      providers: [
        provideRouter([]),
        { provide: PostsService, useClass: MockPostsService },
        { provide: CommentsService, useClass: MockCommentsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'p1' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService) as unknown as MockPostsService;
    commentsService = TestBed.inject(CommentsService) as unknown as MockCommentsService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load post on init with route param id', () => {
    expect(postsService.getPost).toHaveBeenCalledWith('p1');
  });

  it('should load comments on init with route param id', () => {
    expect(commentsService.loadCommentsByPost).toHaveBeenCalledWith('p1');
  });

  it('should set post signal after loadPost resolves', () => {
    expect(component.post()).toEqual(mockPost);
  });

  it('should call createComment when onCommentSubmit is called', () => {
    const dto: ICreateCommentDTO = {
      postId: 'p1',
      name: 'Alice',
      email: 'a@example.com',
      body: 'Nice!',
    };
    component.onCommentSubmit(dto);
    expect(commentsService.createComment).toHaveBeenCalledWith(dto);
  });

  it('should call nextPage and reload comments on onNextPage', () => {
    component.onNextPage();
    expect(commentsService.nextPage).toHaveBeenCalled();
    expect(commentsService.loadCommentsByPost).toHaveBeenCalledWith('p1');
  });

  it('should call prevPage and reload comments on onPrevPage', () => {
    component.onPrevPage();
    expect(commentsService.prevPage).toHaveBeenCalled();
    expect(commentsService.loadCommentsByPost).toHaveBeenCalledWith('p1');
  });
});
