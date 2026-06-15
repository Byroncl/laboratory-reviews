// pipes/date-ago.pipe.spec.ts
import { DateAgoPipe } from './date-ago.pipe';

describe('DateAgoPipe', () => {
  let pipe: DateAgoPipe;

  const dateSecondsAgo = (n: number): Date => new Date(Date.now() - n * 1000);

  beforeEach(() => {
    pipe = new DateAgoPipe();
  });

  it('should return an empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return an empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return an empty string for an invalid date string', () => {
    expect(pipe.transform('not-a-date')).toBe('');
  });

  it('should return "X seconds ago" for recent timestamps', () => {
    const result = pipe.transform(dateSecondsAgo(30));
    expect(result).toMatch(/\d+ seconds ago/);
  });

  it('should return "1 second ago" for a single second', () => {
    const result = pipe.transform(dateSecondsAgo(1));
    expect(result).toBe('1 second ago');
  });

  it('should return "1 minute ago" for 90 seconds ago', () => {
    const result = pipe.transform(dateSecondsAgo(90));
    expect(result).toBe('1 minute ago');
  });

  it('should return "5 minutes ago" for 5 minutes ago', () => {
    const result = pipe.transform(dateSecondsAgo(5 * 60));
    expect(result).toBe('5 minutes ago');
  });

  it('should return "2 hours ago" for 2 hours ago', () => {
    const result = pipe.transform(dateSecondsAgo(2 * 3600));
    expect(result).toBe('2 hours ago');
  });

  it('should return "2 days ago" for 2 days ago', () => {
    const result = pipe.transform(dateSecondsAgo(2 * 86400));
    expect(result).toBe('2 days ago');
  });

  it('should accept a numeric timestamp', () => {
    const ts = Date.now() - 3 * 60 * 1000;
    const result = pipe.transform(ts);
    expect(result).toBe('3 minutes ago');
  });

  it('should accept a date string', () => {
    const d = new Date(Date.now() - 10 * 3600 * 1000);
    const result = pipe.transform(d.toISOString());
    expect(result).toMatch(/\d+ hours ago/);
  });
});
