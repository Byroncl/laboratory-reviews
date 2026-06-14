// pages/post-form.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { convertToParamMap } from '@angular/router';

import { PostFormComponent } from './post-form.component';
import { PostsService } from '../services/posts.service';
import { IPost, IPostResponse } from '../interfaces';

const mockPost: IPost = {
  _id: 'post-1',
  id: 'post-1',
  title: 'Existing Post',
  content: 'Existing body content that is long enough to be valid',
  author: 'Alice',
  status: 'draft',
  tags: ['angular', 'frontend'],
};

class MockPostsService {
  createPost = jasmine.createSpy('createPost').and.returnValue(
    of({ data: mockPost, message: 'created' } as IPostResponse),
  );
  updatePost = jasmine.createSpy('updatePost').and.returnValue(
    of({ data: mockPost, message: 'updated' } as IPostResponse),
  );
  getPost = jasmine.createSpy('getPost').and.returnValue(
    of({ data: mockPost, message: 'ok' } as IPostResponse),
  );
}

function buildTestBed(paramMapValue: Record<string, string>) {
  return TestBed.configureTestingModule({
    imports: [PostFormComponent],
    providers: [
      provideRouter([]),
      { provide: PostsService, useClass: MockPostsService },
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap(paramMapValue)),
        },
      },
    ],
  });
}

describe('PostFormComponent — create mode', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;
  let postsService: MockPostsService;
  let router: Router;

  beforeEach(async () => {
    await buildTestBed({}).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService) as unknown as MockPostsService;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode when no id param', () => {
    expect(component.isEditMode()).toBeFalse();
    expect(component.editPostId()).toBeNull();
  });

  it('should have invalid form initially (title and content empty)', () => {
    expect(component.postForm.valid).toBeFalse();
  });

  it('should have content control (not body)', () => {
    expect(component.postForm.get('content')).toBeTruthy();
    expect(component.postForm.get('body')).toBeFalsy();
  });

  it('should have status and tags controls', () => {
    expect(component.postForm.get('status')).toBeTruthy();
    expect(component.postForm.get('tags')).toBeTruthy();
  });

  it('should validate title minLength', () => {
    component.postForm.get('title')?.setValue('ab');
    component.submitted = true;
    const err = component.getFieldError('title');
    expect(err).toBeTruthy();
    expect(err).toContain('too short');
  });

  it('should validate content minLength', () => {
    component.postForm.get('content')?.setValue('short');
    component.submitted = true;
    const err = component.getFieldError('content');
    expect(err).toBeTruthy();
    expect(err).toContain('too short');
  });

  it('should call createPost on submit in create mode', () => {
    component.postForm.setValue({
      title: 'Valid Title Here',
      content: 'This content has enough characters to pass the minimum length requirement.',
      status: '',
      tags: '',
    });

    component.onSubmit();

    expect(postsService.createPost).toHaveBeenCalled();
  });

  it('should submit with only content and title — no status or tags in payload when empty', () => {
    component.postForm.setValue({
      title: 'Valid Title Here',
      content: 'This content has enough characters to pass the minimum length requirement.',
      status: '',
      tags: '',
    });

    component.onSubmit();

    const callArg = postsService.createPost.calls.mostRecent().args[0];
    expect(callArg.content).toBeTruthy();
    expect(callArg.status).toBeUndefined();
    expect(callArg.tags).toBeUndefined();
  });

  it('should include status and tags in payload when provided', () => {
    component.postForm.setValue({
      title: 'Valid Title Here',
      content: 'This content has enough characters to pass the minimum length requirement.',
      status: 'published',
      tags: 'angular, nestjs',
    });

    component.onSubmit();

    const callArg = postsService.createPost.calls.mostRecent().args[0];
    expect(callArg.status).toBe('published');
    expect(callArg.tags).toEqual(['angular', 'nestjs']);
  });

  it('should navigate to /posts after successful create', fakeAsync(() => {
    spyOn(router, 'navigate');

    component.postForm.setValue({
      title: 'Valid Title Here',
      content: 'This content has enough characters to pass the minimum length requirement.',
      status: '',
      tags: '',
    });

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
  }));

  it('should navigate to /posts on cancel', () => {
    spyOn(router, 'navigate');
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
  });

  it('should return null from getFieldError when submitted is false', () => {
    component.submitted = false;
    component.postForm.get('title')?.setValue('');
    expect(component.getFieldError('title')).toBeNull();
  });

  it('should return field errors via getFieldError when submitted is true', () => {
    component.submitted = true;
    component.postForm.get('title')?.setValue('');
    const err = component.getFieldError('title');
    expect(err).toContain('required');
  });

  it('should parse comma-separated tags from form', () => {
    spyOn(router, 'navigate');

    component.postForm.setValue({
      title: 'Valid Title Here',
      content: 'This content has enough characters to pass the minimum length requirement.',
      status: '',
      tags: 'angular, nestjs, typescript',
    });

    component.onSubmit();

    const callArg = postsService.createPost.calls.mostRecent().args[0];
    expect(callArg.tags).toEqual(['angular', 'nestjs', 'typescript']);
  });
});

describe('PostFormComponent — edit mode', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;
  let postsService: MockPostsService;
  let router: Router;

  beforeEach(async () => {
    await buildTestBed({ id: 'post-1' }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService) as unknown as MockPostsService;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should initialize in edit mode when id param is present', () => {
    expect(component.isEditMode()).toBeTrue();
    expect(component.editPostId()).toBe('post-1');
  });

  it('should load post data for edit mode', () => {
    expect(postsService.getPost).toHaveBeenCalledWith('post-1');
  });

  it('should patch form with loaded post title and content', () => {
    expect(component.postForm.get('title')?.value).toBe('Existing Post');
    expect(component.postForm.get('content')?.value).toBe('Existing body content that is long enough to be valid');
  });

  it('should patch form with loaded post status and tags', () => {
    expect(component.postForm.get('status')?.value).toBe('draft');
    // tags are joined as comma-separated string
    expect(component.postForm.get('tags')?.value).toBe('angular, frontend');
  });

  it('should call updatePost on submit in edit mode', () => {
    spyOn(router, 'navigate');
    component.onSubmit();
    expect(postsService.updatePost).toHaveBeenCalledWith('post-1', jasmine.any(Object));
  });

  it('should navigate to /posts after successful update', fakeAsync(() => {
    spyOn(router, 'navigate');
    component.onSubmit();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
  }));
});
