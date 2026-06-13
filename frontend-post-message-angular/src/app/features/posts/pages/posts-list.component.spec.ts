import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostsListComponent } from './posts-list.component';
import { PostsService } from '../services/posts.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Post } from '../../../shared/models/post.model';

describe('PostsListComponent', () => {
  let component: PostsListComponent;
  let fixture: ComponentFixture<PostsListComponent>;
  let postsService: PostsService;
  let httpMock: HttpTestingController;

  const mockPosts: Post[] = [
    {
      _id: '1',
      title: 'Angular Post',
      content: 'Content about Angular',
      author: 'Alice',
      userId: 'u1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      _id: '2',
      title: 'NestJS Post',
      content: 'Content about NestJS',
      author: 'Bob',
      userId: 'u2',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PostsListComponent,
        HttpClientTestingModule,
      ],
      providers: [
        provideRouter([]),
        PostsService,
        {
          provide: NotificationService,
          useValue: { error: jasmine.createSpy('error'), toast: jasmine.createSpy('toast') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsListComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: [], message: 'OK' });
    tick(300);
    expect(component).toBeTruthy();
  }));

  it('should display loading skeleton while loading', fakeAsync(() => {
    postsService.loading.set(true);
    fixture.detectChanges();
    tick();

    const skeleton = fixture.nativeElement.querySelector('app-loading-skeleton');
    expect(skeleton).toBeTruthy();

    // clean up pending request
    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: [], message: 'OK' });
    tick(300);
  }));

  it('should display empty state when no posts match', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: [], message: 'OK' });
    tick(300);

    postsService.loading.set(false);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('app-empty-state');
    expect(emptyState).toBeTruthy();
  }));

  it('should update filteredPosts when search query is set', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: mockPosts, message: 'OK' });
    tick(300);

    postsService.setSearch('Angular');
    fixture.detectChanges();

    expect(postsService.filteredPosts().length).toBe(1);
    expect(postsService.filteredPosts()[0].title).toContain('Angular');
  }));

  it('should update filteredPosts when author filter is set', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: mockPosts, message: 'OK' });
    tick(300);

    postsService.filterAuthor.set('Alice');
    fixture.detectChanges();

    expect(postsService.filteredPosts().length).toBe(1);
    expect(postsService.filteredPosts()[0].author).toBe('Alice');
  }));

  it('should call resetFilters when clear filters button is clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: mockPosts, message: 'OK' });
    tick(300);

    postsService.filterAuthor.set('Alice');
    fixture.detectChanges();
    expect(postsService.filteredPosts().length).toBe(1);

    const clearBtn = fixture.nativeElement.querySelector('button[class*="bg-gray-400"]') as HTMLButtonElement;
    clearBtn?.click();
    fixture.detectChanges();

    expect(postsService.filterAuthor()).toBe('');
    expect(postsService.filteredPosts().length).toBe(2);
  }));

  it('should display post cards when posts are loaded', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: mockPosts, message: 'OK' });
    tick(300);

    postsService.loading.set(false);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('[data-cy="post-card"]');
    expect(cards.length).toBe(2);
  }));

  it('should show pagination controls when posts are loaded', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const req = httpMock.expectOne(r => r.url.includes('/posts'));
    req.flush({ data: { items: mockPosts, total: 20 }, message: 'OK' });
    tick(300);

    postsService.loading.set(false);
    fixture.detectChanges();

    const nextBtn = fixture.nativeElement.querySelector('[data-cy="next-button"]');
    const prevBtn = fixture.nativeElement.querySelector('[data-cy="prev-button"]');
    expect(nextBtn).toBeTruthy();
    expect(prevBtn).toBeTruthy();
  }));
});
