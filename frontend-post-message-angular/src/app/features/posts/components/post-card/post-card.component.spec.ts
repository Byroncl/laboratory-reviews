// components/post-card/post-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCardComponent } from './post-card.component';
import { IPost } from '../../interfaces';

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;

  const mockPost: IPost = {
    id: 'post-1',
    _id: 'post-1',
    title: 'Test Post Title',
    content: 'This is the test post body content for display.',
    author: 'Alice',
    status: 'draft',
    tags: ['angular'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
    component.post = mockPost;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render post title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Post Title');
  });

  it('should render post author', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Alice');
  });

  it('should apply PostStatusPipe to status — draft becomes "Draft"', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Draft');
  });

  it('should emit view event with post id', () => {
    let emittedId: string | undefined;
    component.view.subscribe((id: string) => { emittedId = id; });

    const viewBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-primary');
    viewBtn.click();

    expect(emittedId).toBe('post-1');
  });

  it('should emit edit event with post id', () => {
    let emittedId: string | undefined;
    component.edit.subscribe((id: string) => { emittedId = id; });

    const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-secondary');
    editBtn.click();

    expect(emittedId).toBe('post-1');
  });

  it('should emit publish event with post id (draft post)', () => {
    let emittedId: string | undefined;
    component.publish.subscribe((id: string) => { emittedId = id; });

    const publishBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-success');
    expect(publishBtn).toBeTruthy();
    publishBtn.click();

    expect(emittedId).toBe('post-1');
  });

  it('should emit archive event with post id (published post)', () => {
    component.post = { ...mockPost, status: 'published' };
    fixture.detectChanges();

    let emittedId: string | undefined;
    component.archive.subscribe((id: string) => { emittedId = id; });

    const archiveBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-warning');
    expect(archiveBtn).toBeTruthy();
    archiveBtn.click();

    expect(emittedId).toBe('post-1');
  });

  it('should emit delete event with post id when confirm returns true', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    let emittedId: string | undefined;
    component.delete.subscribe((id: string) => { emittedId = id; });

    const deleteBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-danger');
    deleteBtn.click();

    expect(window.confirm).toHaveBeenCalled();
    expect(emittedId).toBe('post-1');
  });

  it('should NOT emit delete event when confirm returns false', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    let emittedId: string | undefined;
    component.delete.subscribe((id: string) => { emittedId = id; });

    const deleteBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-danger');
    deleteBtn.click();

    expect(emittedId).toBeUndefined();
  });

  it('should have all action buttons present when isLoading is false', () => {
    component.isLoading = false;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
