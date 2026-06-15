import { IPagination } from '../interfaces';

/**
 * Calculates total number of pages based on limit and total items
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Calculates current page number from skip and limit
 */
export function calculateCurrentPage(skip: number, limit: number): number {
  return Math.floor(skip / limit) + 1;
}

/**
 * Checks if pagination can go to next page
 */
export function canGoToNextPage(pagination: IPagination): boolean {
  const currentPage = calculateCurrentPage(pagination.skip, pagination.limit);
  const totalPages = calculateTotalPages(pagination.total, pagination.limit);
  return currentPage < totalPages;
}

/**
 * Checks if pagination can go to previous page
 */
export function canGoToPreviousPage(pagination: IPagination): boolean {
  return pagination.skip > 0;
}

/**
 * Calculates skip value for next page
 */
export function getNextPageSkip(pagination: IPagination): number {
  if (!canGoToNextPage(pagination)) return pagination.skip;
  return pagination.skip + pagination.limit;
}

/**
 * Calculates skip value for previous page
 */
export function getPreviousPageSkip(pagination: IPagination): number {
  if (!canGoToPreviousPage(pagination)) return 0;
  return Math.max(0, pagination.skip - pagination.limit);
}

/**
 * Resets pagination to initial state
 */
export function resetPagination(limit: number): IPagination {
  return {
    skip: 0,
    limit,
    total: 0,
  };
}

/**
 * Validates pagination parameters
 */
export function isValidPaginationParams(skip: number, limit: number, maxLimit: number): boolean {
  return skip >= 0 && limit > 0 && limit <= maxLimit;
}
