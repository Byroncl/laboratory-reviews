import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplyFormComponent } from './reply-form.component';
import { CommentsService } from '../../services';
import { FilesService } from '../../../../core/services/files.service';
import { ApiService } from '../../../../core/services/api.service';
import { MediaUploadResult } from '../../../../shared/models/media-upload.model';
import { of } from 'rxjs';

class MockCommentsService {
  replyToComment = jasmine
    .createSpy('replyToComment')
    .and.returnValue(
      of({ statusCode: 201, success: true, message: 'created', data: { post: 'post-1', content: 'reply' } }),
    );
}

class MockFilesService {
  uploadFiles = jasmine
    .createSpy('uploadFiles')
    .and.returnValue(
      of({ data: [{ url: 'http://example.com/r.jpg', filename: 'r.jpg' }], message: 'ok' }),
    );
}

class MockApiService {}

describe('ReplyFormComponent', () => {
  let component: ReplyFormComponent;
  let fixture: ComponentFixture<ReplyFormComponent>;
  let commentsService: MockCommentsService;
  let filesService: MockFilesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyFormComponent],
      providers: [
        { provide: CommentsService, useClass: MockCommentsService },
        { provide: FilesService, useClass: MockFilesService },
        { provide: ApiService, useClass: MockApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplyFormComponent);
    component = fixture.componentInstance;
    component.postId = 'post-1';
    component.parentCommentId = 'comment-1';
    commentsService = TestBed.inject(CommentsService) as unknown as MockCommentsService;
    filesService = TestBed.inject(FilesService) as unknown as MockFilesService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // FR-19: renders app-media-upload
  it('should render app-media-upload element', () => {
    const el = fixture.nativeElement.querySelector('app-media-upload');
    expect(el).toBeTruthy();
  });

  // FR-19: submit without media skips uploadFiles
  it('should NOT call FilesService.uploadFiles when no files are selected', () => {
    component.replyForm.setValue({ content: 'Nice reply' });
    component.onSubmit();
    expect(filesService.uploadFiles).not.toHaveBeenCalled();
    expect(commentsService.replyToComment).toHaveBeenCalled();
  });

  // FR-19: submit with media includes media arrays in DTO
  it('should include media arrays in DTO when mediaResult is set', async () => {
    const mediaResult: MediaUploadResult = {
      mediaUrls: ['http://example.com/r.jpg'],
      mediaTypes: ['image/jpeg'],
      mediaFilenames: ['r.jpg'],
    };
    component.mediaResult.set(mediaResult);
    component.replyForm.setValue({ content: 'Reply with media' });
    component.onSubmit();

    await fixture.whenStable();
    expect(commentsService.replyToComment).toHaveBeenCalledWith(
      'comment-1',
      jasmine.objectContaining({
        mediaUrls: ['http://example.com/r.jpg'],
        mediaTypes: ['image/jpeg'],
        mediaFilenames: ['r.jpg'],
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

  it('should reset form and emit on cancel', () => {
    let cancelFired = false;
    component.cancelled.subscribe(() => { cancelFired = true; });
    component.onCancel();
    expect(cancelFired).toBeTrue();
  });
});
