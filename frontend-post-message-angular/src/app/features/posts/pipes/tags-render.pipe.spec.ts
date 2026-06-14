// pipes/tags-render.pipe.spec.ts
import { TagsRenderPipe } from './tags-render.pipe';

describe('TagsRenderPipe', () => {
  let pipe: TagsRenderPipe;

  beforeEach(() => {
    pipe = new TagsRenderPipe();
  });

  it('should return an empty array for null', () => {
    expect(pipe.transform(null)).toEqual([]);
  });

  it('should return an empty array for undefined', () => {
    expect(pipe.transform(undefined)).toEqual([]);
  });

  it('should return an empty array for an empty array', () => {
    expect(pipe.transform([])).toEqual([]);
  });

  it('should map a single tag to a badge object', () => {
    expect(pipe.transform(['ng'])).toEqual([{ label: 'ng' }]);
  });

  it('should map multiple tags to badge objects', () => {
    expect(pipe.transform(['ng', 'nest'])).toEqual([
      { label: 'ng' },
      { label: 'nest' },
    ]);
  });

  it('should preserve tag casing', () => {
    expect(pipe.transform(['Angular', 'NestJS'])).toEqual([
      { label: 'Angular' },
      { label: 'NestJS' },
    ]);
  });
});
