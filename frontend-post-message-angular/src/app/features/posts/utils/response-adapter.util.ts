import { IPost, IPostListResponse } from '../interfaces';
import { POSTS_PAGINATION_DEFAULTS } from '../constants/pagination.constants';

/**
 * Raw backend list response shape from GET /posts.
 * Backend returns: { data: { items, skip, limit, total }, statusCode, success, message }
 */
interface RawPostListResponse {
  data?: {
    items?: IPost[];
    skip?: number;
    limit?: number;
    total?: number;
  } | null;
  message?: string;
  statusCode?: number;
  success?: boolean;
}

/**
 * Raw backend generic response shape.
 * Backend wraps every response as: { data, statusCode, success, message, timestamp }
 */
interface RawApiResponse<T> {
  data?: T;
  statusCode?: number;
  success?: boolean;
  message?: string;
  timestamp?: string;
}

const FALLBACK_POST_LIST: IPostListResponse = {
  data: [],
  pagination: { skip: 0, limit: POSTS_PAGINATION_DEFAULTS.LIMIT, total: 0 },
  message: '',
};

/**
 * Adapts the raw NestJS paginated post list response to the frontend IPostListResponse shape.
 *
 * Backend:  { data: { items: IPost[], skip, limit, total }, statusCode, success, message }
 * Frontend: { data: IPost[], pagination: { skip, limit, total }, message }
 *
 * Returns the safe fallback when the input is malformed. Never throws.
 */
export function adaptPostListResponse(raw: unknown): IPostListResponse {
  try {
    const response = raw as RawPostListResponse;

    if (!response || typeof response !== 'object') {
      console.error('[adaptPostListResponse] Received non-object response:', raw);
      return { ...FALLBACK_POST_LIST };
    }

    const inner = response.data;

    if (!inner || typeof inner !== 'object') {
      console.error('[adaptPostListResponse] Missing or null data envelope:', raw);
      return { ...FALLBACK_POST_LIST, message: response.message ?? '' };
    }

    const items = Array.isArray(inner.items) ? inner.items : [];
    const skip = typeof inner.skip === 'number' ? inner.skip : 0;
    const limit = typeof inner.limit === 'number' ? inner.limit : POSTS_PAGINATION_DEFAULTS.LIMIT;
    const total = typeof inner.total === 'number' ? inner.total : 0;

    return {
      data: items,
      pagination: { skip, limit, total },
      message: response.message ?? '',
    };
  } catch (err) {
    console.error('[adaptPostListResponse] Unexpected error:', err);
    return { ...FALLBACK_POST_LIST };
  }
}

/**
 * Unwraps a generic NestJS API response envelope, returning the inner data.
 *
 * Backend: { data: T, statusCode, success, message, timestamp }
 * Returns: T | null
 *
 * Returns null when the input is malformed. Never throws.
 */
export function adaptApiResponse<T>(raw: unknown): T | null {
  try {
    if (raw === undefined || raw === null) {
      console.error('[adaptApiResponse] Received null/undefined response');
      return null;
    }

    if (typeof raw !== 'object') {
      console.error('[adaptApiResponse] Received non-object response:', raw);
      return null;
    }

    const response = raw as RawApiResponse<T>;

    if (response.data === undefined || response.data === null) {
      console.error('[adaptApiResponse] Missing data in response envelope:', raw);
      return null;
    }

    return response.data;
  } catch (err) {
    console.error('[adaptApiResponse] Unexpected error:', err);
    return null;
  }
}
