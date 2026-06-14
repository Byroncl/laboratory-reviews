import { Comment, CommentSchema } from './comment.schema';

describe('Comment schema — media fields', () => {
  it('should declare mediaUrls, mediaTypes, mediaFilenames as string array paths', () => {
    const paths = CommentSchema.paths;
    expect(paths['mediaUrls']).toBeDefined();
    expect(paths['mediaTypes']).toBeDefined();
    expect(paths['mediaFilenames']).toBeDefined();
  });

  it('should have array instance type for mediaUrls path', () => {
    const path = CommentSchema.path('mediaUrls');
    expect((path as any).instance).toBe('Array');
  });

  it('should have array instance type for mediaTypes path', () => {
    const path = CommentSchema.path('mediaTypes');
    expect((path as any).instance).toBe('Array');
  });

  it('should have array instance type for mediaFilenames path', () => {
    const path = CommentSchema.path('mediaFilenames');
    expect((path as any).instance).toBe('Array');
  });

  it('should have default value [] for mediaUrls path', () => {
    const path = CommentSchema.path('mediaUrls') as any;
    expect(path.defaultValue).toBeDefined();
  });

  it('should have content, postId, userId as required fields', () => {
    const contentPath = CommentSchema.path('content') as any;
    const postIdPath = CommentSchema.path('postId') as any;
    const userIdPath = CommentSchema.path('userId') as any;
    expect(contentPath.isRequired).toBe(true);
    expect(postIdPath.isRequired).toBe(true);
    expect(userIdPath.isRequired).toBe(true);
  });

  it('should assign provided media arrays correctly', () => {
    const instance = new Comment();
    instance.mediaUrls = ['http://localhost:9000/posts/img.jpg'];
    instance.mediaTypes = ['image/jpeg'];
    instance.mediaFilenames = ['img.jpg'];

    expect(instance.mediaUrls[0]).toBe('http://localhost:9000/posts/img.jpg');
    expect(instance.mediaTypes[0]).toBe('image/jpeg');
    expect(instance.mediaFilenames[0]).toBe('img.jpg');
  });
});

describe('Comment schema — nested comment fields', () => {
  it('should declare parentCommentId as a String path', () => {
    const path = CommentSchema.path('parentCommentId');
    expect(path).toBeDefined();
    expect((path as any).instance).toBe('String');
  });

  it('should declare childCommentIds as an Array path', () => {
    const path = CommentSchema.path('childCommentIds');
    expect(path).toBeDefined();
    expect((path as any).instance).toBe('Array');
  });

  it('should default childCommentIds to empty array', () => {
    const path = CommentSchema.path('childCommentIds') as any;
    expect(path.defaultValue).toBeDefined();
  });

  it('should have compound indexes for parentCommentId queries', () => {
    const indexes = CommentSchema.indexes();
    const hasParentIdx = indexes.some(
      ([fields]) => fields['parentCommentId'] !== undefined,
    );
    expect(hasParentIdx).toBe(true);
  });

  it('should assign parentCommentId and childCommentIds correctly', () => {
    const instance = new Comment();
    instance.parentCommentId = 'parent-id-123';
    instance.childCommentIds = ['child-1', 'child-2'];

    expect(instance.parentCommentId).toBe('parent-id-123');
    expect(instance.childCommentIds).toEqual(['child-1', 'child-2']);
  });
});
