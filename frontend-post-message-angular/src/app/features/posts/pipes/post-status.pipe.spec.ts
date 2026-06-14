// pipes/post-status.pipe.spec.ts
import { PostStatusPipe } from './post-status.pipe';

describe('PostStatusPipe', () => {
  let pipe: PostStatusPipe;

  beforeEach(() => {
    pipe = new PostStatusPipe();
  });

  it('should transform "draft" to "Draft"', () => {
    expect(pipe.transform('draft')).toBe('Draft');
  });

  it('should transform "published" to "Published"', () => {
    expect(pipe.transform('published')).toBe('Published');
  });

  it('should transform "archived" to "Archived"', () => {
    expect(pipe.transform('archived')).toBe('Archived');
  });

  it('should return "Unknown" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('Unknown');
  });

  it('should return "Unknown" for null (via undefined cast)', () => {
    expect(pipe.transform(undefined)).toBe('Unknown');
  });

  it('should return original value for unknown status strings', () => {
    expect(pipe.transform('pending')).toBe('pending');
  });
});
