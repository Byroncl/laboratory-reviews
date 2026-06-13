import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PostDetailComponent } from './post-detail.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { selectIsAuthenticated } from '../../auth/store/auth.selectors';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PostsService } from '../services/posts.service';
import { CommentsService } from '../services/comments.service';
import { signal } from '@angular/core';
import { Post } from '../../../shared/models/post.model';

const mockPost: Post = {
  _id: 'p1',
  title: 'Hello',
  content: 'World',
  author: 'alice',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

class MockPostsService {
  selectedPost = signal<Post | null>(mockPost);
  loading = signal(false);
  getPost = () => of({ data: mockPost, message: 'ok' });
}

class MockCommentsService {
  comments = signal<any[]>([]);
  loading = signal(false);
  getCommentsByPost = () => of(null);
}

describe('PostDetailComponent — auth gating', () => {
  let fixture: ComponentFixture<PostDetailComponent>;
  let component: PostDetailComponent;
  let store: MockStore;

  async function setup(isAuthenticated: boolean) {
    await TestBed.configureTestingModule({
      imports: [
        PostDetailComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        provideMockStore({
          initialState: {
            auth: {
              user: isAuthenticated ? { id: 'u1', username: 'alice', role: 'user' } : null,
              isLoading: false,
              error: null,
              isAuthenticated,
              token: isAuthenticated ? 'tok' : null,
            },
          },
        }),
        { provide: PostsService, useClass: MockPostsService },
        { provide: CommentsService, useClass: MockCommentsService },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 'p1' }), snapshot: { queryParams: {} } },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
  }

  it('hides comment form when user is not authenticated', fakeAsync(async () => {
    await setup(false);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('[data-cy="comment-form"]');
    expect(form).toBeNull();
  }));

  it('shows comment form when user is authenticated', fakeAsync(async () => {
    await setup(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('[data-cy="comment-form"]');
    expect(form).not.toBeNull();
  }));

  it('back link points to / not /dashboard/posts', fakeAsync(async () => {
    await setup(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const backLink = compiled.querySelector('a[href="/"]') ?? compiled.querySelector('a[routerLink="/"]');
    // Either href or routerLink should be /
    const links = compiled.querySelectorAll('a');
    const backHref = Array.from(links).find(l => l.textContent?.includes('Back'));
    expect(backHref?.getAttribute('routerLink') ?? backHref?.getAttribute('href')).toBe('/');
  }));
});
