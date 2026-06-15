// components/bulk-upload/bulk-upload.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BulkUploadComponent } from './bulk-upload.component';
import { PostsService } from '../../services/posts.service';
import { IBulkCreateResponse } from '../../interfaces';

class MockPostsService {
  bulkCreatePosts = jasmine.createSpy('bulkCreatePosts').and.returnValue(
    of({ created: 3, failed: 0 } as IBulkCreateResponse),
  );
}

function makeFile(content: string, name = 'posts.json'): File {
  const blob = new Blob([content], { type: 'application/json' });
  return new File([blob], name, { type: 'application/json' });
}

function triggerFileInput(component: BulkUploadComponent, file: File): void {
  const event = { target: { files: [file] } } as unknown as Event;
  component.onFileSelected(event);
}

describe('BulkUploadComponent', () => {
  let component: BulkUploadComponent;
  let fixture: ComponentFixture<BulkUploadComponent>;
  let postsService: MockPostsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadComponent],
      providers: [{ provide: PostsService, useClass: MockPostsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BulkUploadComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService) as unknown as MockPostsService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have no parsed count initially', () => {
    expect(component.parsedCount()).toBe(0);
  });

  it('canUpload should be false when nothing is parsed', () => {
    expect(component.canUpload).toBeFalse();
  });

  describe('JSON parsing', () => {
    it('should parse valid JSON array and set parsedCount', fakeAsync(() => {
      const validJson = JSON.stringify([
        { content: 'Post 1 content' },
        { content: 'Post 2 content' },
        { content: 'Post 3 content' },
      ]);

      const file = makeFile(validJson);
      // Mock FileReader since jsdom doesn't fully support it
      const readerSpy = {
        onload: null as any,
        onerror: null as any,
        readAsText: jasmine.createSpy('readAsText').and.callFake(function(this: any) {
          if (this.onload) {
            this.onload({ target: { result: validJson } } as any);
          }
        }),
      };
      spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

      triggerFileInput(component, file);
      tick();
      fixture.detectChanges();

      expect(component.parsedCount()).toBe(3);
      expect(component.invalidRows().length).toBe(0);
      expect(component.canUpload).toBeTrue();
    }));

    it('should report parse error for invalid JSON', fakeAsync(() => {
      const invalidJson = '{ not valid json }';
      const file = makeFile(invalidJson);

      const readerSpy = {
        onload: null as any,
        onerror: null as any,
        readAsText: jasmine.createSpy('readAsText').and.callFake(function(this: any) {
          if (this.onload) {
            this.onload({ target: { result: invalidJson } } as any);
          }
        }),
      };
      spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

      triggerFileInput(component, file);
      tick();
      fixture.detectChanges();

      expect(component.parseError()).toBeTruthy();
      expect(component.parsedCount()).toBe(0);
    }));

    it('should report parse error when JSON is not an array', fakeAsync(() => {
      const notArray = JSON.stringify({ content: 'single post' });
      const file = makeFile(notArray);

      const readerSpy = {
        onload: null as any,
        onerror: null as any,
        readAsText: jasmine.createSpy('readAsText').and.callFake(function(this: any) {
          if (this.onload) {
            this.onload({ target: { result: notArray } } as any);
          }
        }),
      };
      spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

      triggerFileInput(component, file);
      tick();
      fixture.detectChanges();

      expect(component.parseError()).toBeTruthy();
      expect(component.parsedCount()).toBe(0);
    }));

    it('should report invalid row when content is empty', fakeAsync(() => {
      const withEmptyContent = JSON.stringify([
        { content: 'Valid content here' },
        { content: '' },
      ]);
      const file = makeFile(withEmptyContent);

      const readerSpy = {
        onload: null as any,
        onerror: null as any,
        readAsText: jasmine.createSpy('readAsText').and.callFake(function(this: any) {
          if (this.onload) {
            this.onload({ target: { result: withEmptyContent } } as any);
          }
        }),
      };
      spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

      triggerFileInput(component, file);
      tick();
      fixture.detectChanges();

      expect(component.invalidRows().length).toBe(1);
      expect(component.invalidRows()[0].index).toBe(2);
      expect(component.canUpload).toBeFalse();
    }));

    it('should report invalid row when status is unknown enum value', fakeAsync(() => {
      const withBadStatus = JSON.stringify([
        { content: 'Valid', status: 'banana' },
      ]);
      const file = makeFile(withBadStatus);

      const readerSpy = {
        onload: null as any,
        onerror: null as any,
        readAsText: jasmine.createSpy('readAsText').and.callFake(function(this: any) {
          if (this.onload) {
            this.onload({ target: { result: withBadStatus } } as any);
          }
        }),
      };
      spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

      triggerFileInput(component, file);
      tick();
      fixture.detectChanges();

      expect(component.invalidRows().length).toBe(1);
    }));

    it('should reject non-.json file extension', () => {
      const csvFile = new File(['a,b,c'], 'posts.csv', { type: 'text/csv' });
      triggerFileInput(component, csvFile);

      expect(component.parseError()).toContain('.json');
      expect(component.parsedCount()).toBe(0);
    });
  });

  describe('onUpload()', () => {
    it('should not call bulkCreatePosts when canUpload is false', () => {
      component.onUpload();
      expect(postsService.bulkCreatePosts).not.toHaveBeenCalled();
    });

    it('should call bulkCreatePosts with parsed DTOs and show result', fakeAsync(() => {
      const validJson = JSON.stringify([
        { content: 'Post A' },
        { content: 'Post B' },
        { content: 'Post C' },
      ]);
      const file = makeFile(validJson);

      const readerSpy = {
        onload: null as any,
        onerror: null as any,
        readAsText: jasmine.createSpy('readAsText').and.callFake(function(this: any) {
          if (this.onload) {
            this.onload({ target: { result: validJson } } as any);
          }
        }),
      };
      spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

      triggerFileInput(component, file);
      tick();
      fixture.detectChanges();

      expect(component.canUpload).toBeTrue();

      component.onUpload();
      tick();
      fixture.detectChanges();

      expect(postsService.bulkCreatePosts).toHaveBeenCalled();
      const callArgs = (postsService.bulkCreatePosts as jasmine.Spy).calls.mostRecent().args[0];
      expect(callArgs.length).toBe(3);

      expect(component.uploadResult()).toEqual({ created: 3, failed: 0 });
      expect(component.parsedCount()).toBe(0); // reset after upload
    }));

    it('should show error message when bulkCreatePosts fails', fakeAsync(() => {
      (postsService.bulkCreatePosts as jasmine.Spy).and.returnValue(
        throwError(() => new Error('Upload failed')),
      );

      const validJson = JSON.stringify([{ content: 'Post A' }]);
      const file = makeFile(validJson);

      const readerSpy = {
        onload: null as any,
        onerror: null as any,
        readAsText: jasmine.createSpy('readAsText').and.callFake(function(this: any) {
          if (this.onload) {
            this.onload({ target: { result: validJson } } as any);
          }
        }),
      };
      spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

      triggerFileInput(component, file);
      tick();

      component.onUpload();
      tick();
      fixture.detectChanges();

      expect(component.parseError()).toBeTruthy();
      expect(component.isLoading()).toBeFalse();
    }));
  });
});
