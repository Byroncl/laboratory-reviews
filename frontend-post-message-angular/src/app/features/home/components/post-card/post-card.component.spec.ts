import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCardComponent } from './post-card.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { PostViewModel } from '../../../../shared/models/post.model';

const mockPostVM: PostViewModel = {
  id: 'post-1',
  title: 'Test Post Title',
  preview: 'This is a short preview of the post content.',
  authorUsername: 'testuser',
  createdAt: '2024-01-01T00:00:00Z',
  commentCount: 3,
};

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCardComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.componentRef.setInput('post', mockPostVM);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // Task 1.6: signal input renders correctly
  it('renders post title via signal input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Post Title');
  });

  it('renders post preview', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('This is a short preview');
  });

  it('renders author username', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('testuser');
  });

  it('renders comment count badge when commentCount > 0', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('3');
  });

  it('renders [data-cy="post-card"] element', () => {
    const card = fixture.nativeElement.querySelector('[data-cy="post-card"]');
    expect(card).toBeTruthy();
  });

  // Task 1.7: inject(Router) DI — navigate on click
  it('navigates to post detail on card click', () => {
    spyOn(router, 'navigate');
    const card = fixture.nativeElement.querySelector('[data-cy="post-card"]');
    card.click();

    expect(router.navigate).toHaveBeenCalledWith(['/posts', 'post-1']);
  });

  it('navigates to post detail on Enter keydown', () => {
    spyOn(router, 'navigate');
    const card = fixture.nativeElement.querySelector('[data-cy="post-card"]');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(router.navigate).toHaveBeenCalledWith(['/posts', 'post-1']);
  });

  it('does not render thumbnail when imageUrl is absent', () => {
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeFalsy();
  });

  it('renders thumbnail when imageUrl is present', () => {
    fixture.componentRef.setInput('post', { ...mockPostVM, imageUrl: 'https://example.com/img.jpg' });
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/img.jpg');
  });
});
