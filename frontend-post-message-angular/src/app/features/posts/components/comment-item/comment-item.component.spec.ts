import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CommentItemComponent } from './comment-item.component';
import { CommentsService } from '../../services';
import { FilesService } from '../../../../core/services/files.service';
import { ApiService } from '../../../../core/services/api.service';
import { IComment, ICommentMedia } from '../../interfaces';
import { of } from 'rxjs';
import { MEDIA_PREVIEW_LIMIT } from '../../../../shared/constants/media-upload.constants';

class MockCommentsService {
  getReplies = jasmine.createSpy('getReplies').and.returnValue(of({ data: [], pagination: { skip: 0, limit: 10, total: 0 }, message: '' }));
  replyToComment = jasmine.createSpy('replyToComment').and.returnValue(of({}));
}

class MockFilesService {}
class MockApiService {}

function buildComment(overrides: Partial<IComment> = {}): IComment {
  return {
    _id: 'c1',
    post: 'p1',
    content: 'Test comment',
    ...overrides,
  };
}

function buildMedia(count: number): ICommentMedia[] {
  return Array.from({ length: count }, (_, i) => ({
    url: `http://example.com/file-${i}.jpg`,
    type: i % 3 === 0 ? 'application/pdf' : i % 3 === 1 ? 'video/mp4' : 'image/jpeg',
    filename: `file-${i}.${i % 3 === 0 ? 'pdf' : i % 3 === 1 ? 'mp4' : 'jpg'}`,
  }));
}

describe('CommentItemComponent', () => {
  let component: CommentItemComponent;
  let fixture: ComponentFixture<CommentItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentItemComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CommentsService, useClass: MockCommentsService },
        { provide: FilesService, useClass: MockFilesService },
        { provide: ApiService, useClass: MockApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentItemComponent);
    component = fixture.componentInstance;
  });

  // FR-20 negative: no grid when media absent
  it('should not render media grid when comment has no media', () => {
    component.comment = buildComment({ media: undefined });
    component.postId = 'p1';
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('[data-testid="media-grid"]');
    expect(grid).toBeNull();
  });

  it('should not render media grid when media is empty array', () => {
    component.comment = buildComment({ media: [] });
    component.postId = 'p1';
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('[data-testid="media-grid"]');
    expect(grid).toBeNull();
  });

  // FR-21: image rendered as <img>
  it('should render img element for image media items', () => {
    component.comment = buildComment({
      media: [{ url: 'http://example.com/a.jpg', type: 'image/jpeg', filename: 'a.jpg' }],
    });
    component.postId = 'p1';
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img[data-testid="media-image"]');
    expect(img).toBeTruthy();
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  // FR-22: video rendered as <video>
  it('should render video element for video media items', () => {
    component.comment = buildComment({
      media: [{ url: 'http://example.com/v.mp4', type: 'video/mp4', filename: 'v.mp4' }],
    });
    component.postId = 'p1';
    fixture.detectChanges();
    const video = fixture.nativeElement.querySelector('video[data-testid="media-video"]');
    expect(video).toBeTruthy();
    expect(video.hasAttribute('controls')).toBeTrue();
  });

  // FR-23: document card with download link
  it('should render a download link for document media items', () => {
    component.comment = buildComment({
      media: [{ url: 'http://example.com/doc.pdf', type: 'application/pdf', filename: 'doc.pdf' }],
    });
    component.postId = 'p1';
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[data-testid="media-doc-link"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('http://example.com/doc.pdf');
  });

  // FR-24: default shows <= MEDIA_PREVIEW_LIMIT items
  it('should show at most MEDIA_PREVIEW_LIMIT items by default', () => {
    const mediaItems = buildMedia(MEDIA_PREVIEW_LIMIT + 2);
    component.comment = buildComment({ media: mediaItems });
    component.postId = 'p1';
    fixture.detectChanges();

    const visible = component.visibleMedia();
    expect(visible.length).toBeLessThanOrEqual(MEDIA_PREVIEW_LIMIT);
  });

  // FR-25: toggle reveals all items
  it('should show all items after toggleMedia()', () => {
    const count = MEDIA_PREVIEW_LIMIT + 2;
    const mediaItems = buildMedia(count);
    component.comment = buildComment({ media: mediaItems });
    component.postId = 'p1';
    fixture.detectChanges();

    component.toggleMedia();
    fixture.detectChanges();

    expect(component.visibleMedia().length).toBe(count);
  });

  // FR-26: toggle shows "show less" when expanded
  it('should show toggle button when media count exceeds PREVIEW_LIMIT', () => {
    const mediaItems = buildMedia(MEDIA_PREVIEW_LIMIT + 1);
    component.comment = buildComment({ media: mediaItems });
    component.postId = 'p1';
    fixture.detectChanges();

    const toggleBtn = fixture.nativeElement.querySelector('[data-testid="media-toggle"]');
    expect(toggleBtn).toBeTruthy();
  });

  it('should NOT show toggle button when media count <= PREVIEW_LIMIT', () => {
    const mediaItems = buildMedia(MEDIA_PREVIEW_LIMIT);
    component.comment = buildComment({ media: mediaItems });
    component.postId = 'p1';
    fixture.detectChanges();

    const toggleBtn = fixture.nativeElement.querySelector('[data-testid="media-toggle"]');
    expect(toggleBtn).toBeNull();
  });
});
