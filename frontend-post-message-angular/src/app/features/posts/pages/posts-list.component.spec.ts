// pages/posts-list.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';

import { PostsListComponent } from './posts-list.component';
import { PostsService } from '../services/posts.service';
import { IPost, IPagination } from '../interfaces';

const mockPosts: IPost[] = [
  {
    _id: '1',
    title: 'Angular Post',
    body: 'Content about Angular',
    author: 'Alice',
    status: 'published',
  },
  {
    _id: '2',
    title: 'NestJS Post',
    body: 'Content about NestJS',
    author: 'Bob',
    status: 'draft',
  },
];

class MockPostsService {
  items$ = signal<IPost[]>([]);
  posts$ = computed(() => this.items$());
  filteredPosts$ = computed(() => this.items$());
  isLoadingPosts = computed(() => false);
  postError = computed(() => null as string | null);
  pagination$ = computed(() => ({ skip: 0, limit: 10, total: 0 } as IPagination));
  pagination = signal<IPagination>({ skip: 0, limit: 10, total: 0 });

  loadPosts = jasmine.createSpy('loadPosts').and.returnValue(
    of({ data: [], pagination: { skip: 0, limit: 10, total: 0 }, message: 'OK' }),
  );
  updateFilters = jasmine.createSpy('updateFilters');
  clearFilters = jasmine.createSpy('clearFilters');
  deletePost = jasmine.createSpy('deletePost').and.returnValue(of({}));
  publishPost = jasmine.createSpy('publishPost').and.returnValue(of({ data: mockPosts[0], message: 'ok' }));
  archivePost = jasmine.createSpy('archivePost').and.returnValue(of({ data: mockPosts[0], message: 'ok' }));
  nextPage = jasmine.createSpy('nextPage');
  prevPage = jasmine.createSpy('prevPage');
  getFilters = jasmine.createSpy('getFilters').and.returnValue({});
}

describe('PostsListComponent', () => {
  let component: PostsListComponent;
  let fixture: ComponentFixture<PostsListComponent>;
  let postsService: MockPostsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsListComponent],
      providers: [
        provideRouter([]),
        { provide: PostsService, useClass: MockPostsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsListComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService) as unknown as MockPostsService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadPosts on ngOnInit', () => {
    expect(postsService.loadPosts).toHaveBeenCalled();
  });

  it('should call updateFilters when onFilterChange is triggered', () => {
    const filters = { searchTerm: 'test' };
    component.onFilterChange(filters);
    expect(postsService.updateFilters).toHaveBeenCalledWith(filters);
  });

  it('should call clearFilters when onFilterReset is triggered', () => {
    component.onFilterReset();
    expect(postsService.clearFilters).toHaveBeenCalled();
  });

  it('should call deletePost when onPostDelete is triggered', () => {
    component.onPostDelete('post-1');
    expect(postsService.deletePost).toHaveBeenCalledWith('post-1');
  });

  it('should call publishPost when onPostPublish is triggered', () => {
    component.onPostPublish('post-1');
    expect(postsService.publishPost).toHaveBeenCalledWith('post-1');
  });

  it('should call archivePost when onPostArchive is triggered', () => {
    component.onPostArchive('post-1');
    expect(postsService.archivePost).toHaveBeenCalledWith('post-1');
  });

  it('should call nextPage and reload on onNextPage', () => {
    component.onNextPage();
    expect(postsService.nextPage).toHaveBeenCalled();
    expect(postsService.loadPosts).toHaveBeenCalledTimes(2); // once on init, once on nextPage
    expect(postsService.getFilters).toHaveBeenCalled();
  });

  it('should call prevPage and reload on onPrevPage', () => {
    component.onPrevPage();
    expect(postsService.prevPage).toHaveBeenCalled();
    expect(postsService.getFilters).toHaveBeenCalled();
  });
});
