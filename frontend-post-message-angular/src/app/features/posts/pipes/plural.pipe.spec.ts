// pipes/plural.pipe.spec.ts
import { PluralPipe } from './plural.pipe';

describe('PluralPipe', () => {
  let pipe: PluralPipe;

  beforeEach(() => {
    pipe = new PluralPipe();
  });

  it('should return singular form for count 1', () => {
    expect(pipe.transform(1, 'comment')).toBe('1 comment');
  });

  it('should return plural form for count 0', () => {
    expect(pipe.transform(0, 'comment')).toBe('0 comments');
  });

  it('should return plural form for count 2', () => {
    expect(pipe.transform(2, 'comment')).toBe('2 comments');
  });

  it('should return plural form for count 5', () => {
    expect(pipe.transform(5, 'comment')).toBe('5 comments');
  });

  it('should treat null as 0 and return plural', () => {
    expect(pipe.transform(null, 'comment')).toBe('0 comments');
  });

  it('should treat undefined as 0 and return plural', () => {
    expect(pipe.transform(undefined, 'comment')).toBe('0 comments');
  });

  it('should work with other singular words', () => {
    expect(pipe.transform(1, 'tag')).toBe('1 tag');
    expect(pipe.transform(3, 'tag')).toBe('3 tags');
  });
});
