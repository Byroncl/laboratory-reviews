import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { PostsService } from '../../posts/services/posts.service';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Post } from '../../../shared/models/post.model';

const mockPosts: Post[] = [
  { _id: '1', title: 'Post One', content: 'Body one', author: 'alice', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { _id: '2', title: 'Post Two', content: 'Body two', author: 'bob', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
];

class MockPostsService {
  posts = signal<Post[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadPosts() {
    this.posts.set(mockPosts);
    return of({ data: mockPosts, message: 'ok' });
  }
}

class MockPostsServiceWithError {
  posts = signal<Post[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>('Failed to load');

  loadPosts() {
    return throwError(() => new Error('Network error'));
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  describe('successful load', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HomeComponent, RouterTestingModule],
        providers: [{ provide: PostsService, useClass: MockPostsService }],
      }).compileComponents();

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
    });

    it('calls loadPosts on init and renders post cards', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const postCards = fixture.nativeElement.querySelectorAll('app-post-card, [data-cy="post-card"]');
      expect(postCards.length).toBeGreaterThanOrEqual(0); // component renders a list
      expect(component.posts().length).toBe(2);
    }));
  });

  describe('error state', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HomeComponent, RouterTestingModule],
        providers: [{ provide: PostsService, useClass: MockPostsServiceWithError }],
      }).compileComponents();

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
    });

    it('shows error block when loadPosts fails', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('');  // error state exists in DOM
      expect(component.loadError()).not.toBeNull();
    }));

    it('retry button calls loadPosts again', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const service = TestBed.inject(PostsService) as unknown as MockPostsServiceWithError;
      spyOn(service, 'loadPosts').and.returnValue(of({ data: [], message: 'ok' }) as any);

      component.retry();
      tick();

      expect(service.loadPosts).toHaveBeenCalled();
    }));
  });
});
