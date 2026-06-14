import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { PostsService } from '../../posts/services/posts.service';
import { RouterTestingModule } from '@angular/router/testing';
import { computed, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Post } from '../../../shared/models/post.model';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { selectIsAuthenticated } from '../../auth/store/auth.selectors';

const mockPosts: Post[] = [
  { _id: '1', title: 'Angular Post', content: 'Body about angular framework', author: 'alice', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: '2', title: 'React Post', content: 'Body about react library', author: 'bob', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
];

class MockPostsService {
  private readonly _items = signal<Post[]>([]);
  readonly posts$ = computed(() => this._items());

  loadPosts() {
    this._items.set(mockPosts);
    return of({ data: mockPosts, message: 'ok', pagination: { skip: 0, limit: 10, total: 2 } });
  }
}

class MockPostsServiceWithError {
  private readonly _items = signal<Post[]>([]);
  readonly posts$ = computed(() => this._items());

  loadPosts() {
    return throwError(() => new Error('Network error'));
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  describe('successful load (guest state)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HomeComponent, RouterTestingModule],
        providers: [
          { provide: PostsService, useClass: MockPostsService },
          provideMockStore({
            selectors: [{ selector: selectIsAuthenticated, value: false }],
          }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
    });

    it('calls loadPosts on init and renders post cards', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const postCards = fixture.nativeElement.querySelectorAll('[data-cy="post-card"]');
      expect(postCards.length).toBe(2);
    }));

    // TEST-FE-003: hero section present in DOM
    it('renders hero section with title "Discover" (TEST-FE-003)', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const hero = fixture.nativeElement.querySelector('[data-cy="hero-section"]');
      expect(hero).toBeTruthy();
      expect(fixture.nativeElement.textContent).toContain('Discover');
    }));

    // TEST-FE-004: PostCard list renders
    it('renders PostCard components for loaded posts (TEST-FE-004)', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.posts.length).toBe(2);
    }));

    // isAuthenticated signal — guest CTA
    it('renders "Sign in to Comment" CTA when guest (isAuthenticated signal = false)', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const cta = fixture.nativeElement.querySelector('[data-cy="hero-cta"]');
      expect(cta).toBeTruthy();
      expect(cta.textContent.trim()).toBe('Sign in to Comment');
    }));

    // Task 1.3 / 2.5: search input filters via FormControl + filterPosts util
    it('filters posts when search control has a value', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.searchControl.setValue('angular');
      fixture.detectChanges();

      expect(component.filteredPosts().length).toBe(1);
      expect(component.filteredPosts()[0].title).toBe('Angular Post');
    }));

    it('returns all posts when search control is cleared', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.searchControl.setValue('angular');
      fixture.detectChanges();

      component.searchControl.setValue('');
      fixture.detectChanges();

      expect(component.filteredPosts().length).toBe(2);
    }));

    it('shows empty-state message when no posts match search', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.searchControl.setValue('xxxxxxxxxx');
      fixture.detectChanges();

      expect(component.filteredPosts().length).toBe(0);
      expect(fixture.nativeElement.textContent).toContain('No posts match your search.');
    }));
  });

  describe('successful load (authenticated state)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HomeComponent, RouterTestingModule],
        providers: [
          { provide: PostsService, useClass: MockPostsService },
          provideMockStore({
            selectors: [{ selector: selectIsAuthenticated, value: true }],
          }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
    });

    it('renders "Create Post" CTA when authenticated (isAuthenticated signal = true)', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const cta = fixture.nativeElement.querySelector('[data-cy="hero-cta"]');
      expect(cta).toBeTruthy();
      expect(cta.textContent.trim()).toBe('Create Post');
    }));

    it('isAuthenticated signal reads true from MockStore', () => {
      fixture.detectChanges();
      expect(component.isAuthenticated()).toBeTrue();
    });
  });

  describe('error state', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HomeComponent, RouterTestingModule],
        providers: [
          { provide: PostsService, useClass: MockPostsServiceWithError },
          provideMockStore({
            selectors: [{ selector: selectIsAuthenticated, value: false }],
          }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
    });

    it('shows error block when loadPosts fails', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const errorState = fixture.nativeElement.querySelector('[data-cy="error-state"]');
      expect(errorState).toBeTruthy();
      expect(component.loadError()).not.toBeNull();
    }));

    it('retry button calls loadPosts again', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const service = TestBed.inject(PostsService) as unknown as MockPostsServiceWithError;
      (service.loadPosts as jasmine.Spy) = jasmine.createSpy('loadPosts').and.returnValue(of({ data: [], message: 'ok', pagination: { skip: 0, limit: 10, total: 0 } }));

      component.retry();
      tick();

      expect(service.loadPosts).toHaveBeenCalled();
    }));
  });
});
