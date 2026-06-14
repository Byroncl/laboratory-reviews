// pipes/truncate.pipe.spec.ts
import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should return an empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return an empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return the full string when it is shorter than the limit', () => {
    expect(pipe.transform('short', 100)).toBe('short');
  });

  it('should return the full string when it equals the limit exactly', () => {
    const text = 'a'.repeat(100);
    expect(pipe.transform(text, 100)).toBe(text);
  });

  it('should truncate a 150-char string to 100 chars plus ellipsis (breakWords: true)', () => {
    const text = 'a'.repeat(150);
    const result = pipe.transform(text, 100, true);
    expect(result.length).toBe(101); // 100 chars + '…'
    expect(result.endsWith('…')).toBeTrue();
  });

  it('should break at a word boundary when breakWords is false', () => {
    const text = 'Lorem ipsum dolor sit amet consectetur';
    const result = pipe.transform(text, 20, false);
    expect(result.endsWith('…')).toBeTrue();
    expect(result).toBe('Lorem ipsum dolor…');
  });

  it('should use default length of 100 when not specified', () => {
    const text = 'a'.repeat(150);
    const result = pipe.transform(text);
    expect(result.length).toBe(101);
  });
});
