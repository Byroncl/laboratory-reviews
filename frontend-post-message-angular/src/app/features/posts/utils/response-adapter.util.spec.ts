// utils/response-adapter.util.spec.ts
import { adaptPostListResponse, adaptApiResponse } from './response-adapter.util';
import { IPostListResponse } from '../interfaces';

describe('adaptPostListResponse()', () => {
  it('should map valid backend response to IPostListResponse', () => {
    const raw = {
      data: {
        items: [
          { _id: '1', title: 'Post 1', content: 'Content 1', status: 'published' },
          { _id: '2', title: 'Post 2', content: 'Content 2', status: 'draft' },
        ],
        skip: 0,
        limit: 10,
        total: 2,
      },
      message: 'OK',
      statusCode: 200,
      success: true,
    };

    const result = adaptPostListResponse(raw);

    expect(result.data.length).toBe(2);
    expect(result.data[0]._id).toBe('1');
    expect(result.pagination.skip).toBe(0);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.total).toBe(2);
    expect(result.message).toBe('OK');
  });

  it('should return safe fallback when data is null', () => {
    const raw = {
      data: null,
      message: 'Something went wrong',
      statusCode: 200,
      success: true,
    };

    const result = adaptPostListResponse(raw);

    expect(result.data).toEqual([]);
    expect(result.pagination.skip).toBe(0);
    expect(result.pagination.limit).toBe(0);
    expect(result.pagination.total).toBe(0);
  });

  it('should return safe fallback for empty items list', () => {
    const raw = {
      data: {
        items: [],
        skip: 0,
        limit: 10,
        total: 0,
      },
      message: 'OK',
    };

    const result = adaptPostListResponse(raw);

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.limit).toBe(10);
  });

  it('should return safe fallback when items is missing', () => {
    const raw = {
      data: {
        skip: 0,
        limit: 10,
        total: 5,
      },
      message: 'OK',
    };

    const result = adaptPostListResponse(raw);

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(5);
  });

  it('should return safe fallback when input is undefined', () => {
    const result = adaptPostListResponse(undefined);

    expect(result.data).toEqual([]);
    expect(result.pagination).toEqual({ skip: 0, limit: 0, total: 0 });
  });

  it('should not throw on completely malformed input', () => {
    expect(() => adaptPostListResponse('bad input')).not.toThrow();
    expect(() => adaptPostListResponse(null)).not.toThrow();
    expect(() => adaptPostListResponse(42)).not.toThrow();
  });
});

describe('adaptApiResponse<T>()', () => {
  it('should unwrap data from valid envelope', () => {
    const raw = {
      statusCode: 200,
      success: true,
      message: 'OK',
      data: { id: 'abc', name: 'Test' },
      timestamp: '2026-01-01T00:00:00Z',
    };

    const result = adaptApiResponse<{ id: string; name: string }>(raw);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('abc');
    expect(result!.name).toBe('Test');
  });

  it('should return null when input is undefined', () => {
    const result = adaptApiResponse(undefined);
    expect(result).toBeNull();
  });

  it('should return null when input is null', () => {
    const result = adaptApiResponse(null);
    expect(result).toBeNull();
  });

  it('should return null when data field is missing', () => {
    const raw = {
      statusCode: 200,
      success: true,
      message: 'OK',
    };

    const result = adaptApiResponse(raw);
    expect(result).toBeNull();
  });

  it('should return null when data field is null', () => {
    const raw = {
      statusCode: 200,
      success: true,
      message: 'OK',
      data: null,
    };

    const result = adaptApiResponse(raw);
    expect(result).toBeNull();
  });

  it('should not throw on non-object input', () => {
    expect(() => adaptApiResponse('not an object')).not.toThrow();
    expect(() => adaptApiResponse(123)).not.toThrow();
  });
});
