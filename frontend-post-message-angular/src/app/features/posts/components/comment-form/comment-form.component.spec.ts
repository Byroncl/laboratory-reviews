// components/comment-form/comment-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentFormComponent } from './comment-form.component';
import { CommentsService } from '../../services';
import { ICreateCommentDTO } from '../../interfaces';
import { of } from 'rxjs';

class MockCommentsService {
  createComment = jasmine.createSpy('createComment').and.returnValue(
    of({ statusCode: 201, success: true, message: 'created', data: { post: 'post-123', content: 'test' } }),
  );
}

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [{ provide: CommentsService, useClass: MockCommentsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    component.postId = 'post-123';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.commentForm.valid).toBeFalse();
  });

  it('should show error when content is empty after submit attempt', () => {
    component.commentForm.get('content')?.setValue('');
    component.hasBeenSubmitted = true;
    fixture.detectChanges();

    const error = component.getFieldError('content');
    expect(error).toBeTruthy();
    expect(error).toContain('required');
  });

  it('should emit submit with correct DTO when form is valid', () => {
    const emitted: ICreateCommentDTO[] = [];
    component.submitted.subscribe((d: ICreateCommentDTO) => emitted.push(d));

    component.commentForm.setValue({ content: 'Great post!' });
    component.onSubmit();

    expect(emitted.length).toBe(1);
    expect(emitted[0].post).toBe('post-123');
    expect(emitted[0].content).toBe('Great post!');
  });

  it('should reset form after successful submit', () => {
    component.commentForm.setValue({ content: 'Great post!' });
    component.onSubmit();

    expect(component.commentForm.get('content')?.value).toBeNull();
    expect(component.hasBeenSubmitted).toBeFalse();
  });

  it('should emit cancel event', () => {
    let cancelEmitted = false;
    component.cancel.subscribe(() => {
      cancelEmitted = true;
    });

    component.onCancel();

    expect(cancelEmitted).toBeTrue();
  });

  it('should not emit submit when form is invalid', () => {
    const emitted: ICreateCommentDTO[] = [];
    component.submitted.subscribe((d: ICreateCommentDTO) => emitted.push(d));

    // Leave form empty (invalid)
    component.onSubmit();

    expect(emitted.length).toBe(0);
    expect(component.hasBeenSubmitted).toBeTrue();
  });

  it('should return null from getFieldError when hasBeenSubmitted is false', () => {
    component.commentForm.get('content')?.setValue('');
    component.hasBeenSubmitted = false;

    expect(component.getFieldError('content')).toBeNull();
  });
});
