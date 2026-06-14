import { IPagination } from '../interfaces';

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  if (!total) return 1;
  return Math.ceil(total / limit);
}

/**
 * Calculate current page number
 */
export function calculateCurrentPage(skip: number, limit: number): number {
  return Math.floor(skip / limit) + 1;
}

/**
 * Calculate skip value from page number
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Validate pagination state
 */
export function isValidPagination(pagination: IPagination): boolean {
  return (
    pagination.skip >= 0 &&
    pagination.limit > 0 &&
    pagination.total >= 0 &&
    pagination.skip < pagination.total
  );
}

/**
 * Get next page skip value
 */
export function getNextPageSkip(pagination: IPagination): number | null {
  const nextSkip = pagination.skip + pagination.limit;
  return nextSkip < pagination.total ? nextSkip : null;
}

/**
 * Get previous page skip value
 */
export function getPreviousPageSkip(pagination: IPagination): number | null {
  const prevSkip = Math.max(0, pagination.skip - pagination.limit);
  return prevSkip !== pagination.skip ? prevSkip : null;
}

/**
 * Check if can go to next page
 */
export function canGoToNextPage(pagination: IPagination): boolean {
  return getNextPageSkip(pagination) !== null;
}

/**
 * Check if can go to previous page
 */
export function canGoToPreviousPage(pagination: IPagination): boolean {
  return getPreviousPageSkip(pagination) !== null;
}
