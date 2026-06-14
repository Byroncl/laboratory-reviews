// components/comment-form/comment-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentFormComponent } from './comment-form.component';
import { ICreateCommentDTO } from '../../interfaces';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
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

  it('should show error when name is too short', () => {
    component.commentForm.get('name')?.setValue('a');
    component.submitted = true;
    fixture.detectChanges();

    const error = component.getFieldError('name');
    expect(error).toBeTruthy();
    expect(error).toContain('too short');
  });

  it('should show error when email is invalid', () => {
    component.commentForm.get('email')?.setValue('not-an-email');
    component.submitted = true;
    fixture.detectChanges();

    const error = component.getFieldError('email');
    expect(error).toBeTruthy();
    expect(error).toContain('Invalid email');
  });

  it('should show error when body is empty', () => {
    component.commentForm.get('body')?.setValue('');
    component.submitted = true;
    fixture.detectChanges();

    const error = component.getFieldError('body');
    expect(error).toBeTruthy();
    expect(error).toContain('required');
  });

  it('should emit submit with correct data when form is valid', () => {
    const emitted: ICreateCommentDTO[] = [];
    component.submit.subscribe((d: ICreateCommentDTO) => emitted.push(d));

    component.commentForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      body: 'Great post!',
    });

    component.onSubmit();

    expect(emitted.length).toBe(1);
    expect(emitted[0].postId).toBe('post-123');
    expect(emitted[0].name).toBe('John Doe');
    expect(emitted[0].email).toBe('john@example.com');
    expect(emitted[0].body).toBe('Great post!');
  });

  it('should reset form after successful submit', () => {
    component.commentForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      body: 'Great post!',
    });

    component.onSubmit();

    expect(component.commentForm.get('name')?.value).toBeNull();
    expect(component.commentForm.get('email')?.value).toBeNull();
    expect(component.commentForm.get('body')?.value).toBeNull();
    expect(component.submitted).toBeFalse();
  });

  it('should emit cancel event', () => {
    let cancelEmitted = false;
    component.cancel.subscribe(() => { cancelEmitted = true; });

    component.onCancel();

    expect(cancelEmitted).toBeTrue();
  });

  it('should not emit submit when form is invalid', () => {
    const emitted: ICreateCommentDTO[] = [];
    component.submit.subscribe((d: ICreateCommentDTO) => emitted.push(d));

    // Leave form empty (invalid)
    component.onSubmit();

    expect(emitted.length).toBe(0);
    expect(component.submitted).toBeTrue();
  });

  it('should return null from getFieldError when submitted is false', () => {
    component.commentForm.get('name')?.setValue('');
    component.submitted = false;

    expect(component.getFieldError('name')).toBeNull();
  });
});
