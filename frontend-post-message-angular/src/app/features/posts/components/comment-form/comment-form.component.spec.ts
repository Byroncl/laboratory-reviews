// components/comment-form/comment-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CommentFormComponent } from './comment-form.component';
import { CommentsService } from '../../services';
import { FilesService } from '../../../../core/services/files.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ICreateCommentDTO } from '../../interfaces';
import { MediaUploadResult } from '../../../../shared/models/media-upload.model';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

class MockCommentsService {
  createComment = jasmine.createSpy('createComment').and.returnValue(
    of({ statusCode: 201, success: true, message: 'created', data: { post: 'post-123', content: 'test' } }),
  );
}

class MockFilesService {
  uploadFiles = jasmine
    .createSpy('uploadFiles')
    .and.returnValue(
      of({ data: [{ url: 'http://example.com/a.jpg', filename: 'a.jpg' }], message: 'ok' }),
    );
}

class MockApiService {}

const mockCurrentUser = signal<any>(null);
const mockAuthService = {
  isAuthenticated: computed(() => !!mockCurrentUser()),
  currentUser$: mockCurrentUser,
  isLoading$: signal(false),
  error$: signal<string | null>(null),
};

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;
  let commentsService: MockCommentsService;
  let filesService: MockFilesService;

  beforeEach(async () => {
    // Simulate authenticated user so the form branch renders (not the auth gate)
    mockCurrentUser.set({ id: 'user-1', name: 'Test User' });

    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [
        { provide: CommentsService, useClass: MockCommentsService },
        { provide: FilesService, useClass: MockFilesService },
        { provide: ApiService, useClass: MockApiService },
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    component.postId = 'post-123';
    commentsService = TestBed.inject(CommentsService) as unknown as MockCommentsService;
    filesService = TestBed.inject(FilesService) as unknown as MockFilesService;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockCurrentUser.set(null);
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

  it('should emit submit with correct DTO when form is valid and no media', () => {
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
    component.cancel.subscribe(() => { cancelEmitted = true; });
    component.onCancel();
    expect(cancelEmitted).toBeTrue();
  });

  it('should not emit submit when form is invalid', () => {
    const emitted: ICreateCommentDTO[] = [];
    component.submitted.subscribe((d: ICreateCommentDTO) => emitted.push(d));
    component.onSubmit();
    expect(emitted.length).toBe(0);
    expect(component.hasBeenSubmitted).toBeTrue();
  });

  it('should return null from getFieldError when hasBeenSubmitted is false', () => {
    component.commentForm.get('content')?.setValue('');
    component.hasBeenSubmitted = false;
    expect(component.getFieldError('content')).toBeNull();
  });

  // FR-13: renders app-media-upload
  it('should render app-media-upload element', () => {
    const el = fixture.nativeElement.querySelector('app-media-upload');
    expect(el).toBeTruthy();
  });

  // FR-16: submit without media skips uploadFiles
  it('should NOT call FilesService.uploadFiles when no files are selected', () => {
    component.commentForm.setValue({ content: 'Hello world' });
    component.onSubmit();
    expect(filesService.uploadFiles).not.toHaveBeenCalled();
    expect(commentsService.createComment).toHaveBeenCalled();
  });

  // FR-14: submit with media calls createComment with media arrays
  it('should include media arrays in DTO when mediaResult is set', async () => {
    const mediaResult: MediaUploadResult = {
      mediaUrls: ['http://example.com/a.jpg'],
      mediaTypes: ['image/jpeg'],
      mediaFilenames: ['a.jpg'],
    };
    component.mediaResult.set(mediaResult);
    component.commentForm.setValue({ content: 'Hello with media' });
    component.onSubmit();

    await fixture.whenStable();
    expect(commentsService.createComment).toHaveBeenCalledWith(
      jasmine.objectContaining({
        mediaUrls: ['http://example.com/a.jpg'],
        mediaTypes: ['image/jpeg'],
        mediaFilenames: ['a.jpg'],
      }),
    );
  });

  // FR-17: submit button disabled while uploading
  it('should disable submit button while isUploading is true', () => {
    component.isUploading.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn?.disabled).toBeTrue();
  });
});
