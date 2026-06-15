/**
 * Calculates the total number of pages for pagination.
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * Returns true if the current page is the first page.
 */
export function isFirstPage(currentPage: number): boolean {
  return currentPage === 1;
}

/**
 * Returns true if the current page is the last page.
 */
export function isLastPage(currentPage: number, totalPages: number): boolean {
  return currentPage === totalPages;
}

/**
 * Returns true if navigation to the next page is possible.
 */
export function canGoToNextPage(currentPage: number, totalPages: number): boolean {
  return currentPage < totalPages;
}

/**
 * Returns true if navigation to the previous page is possible.
 */
export function canGoToPreviousPage(currentPage: number): boolean {
  return currentPage > 1;
}

/**
 * Builds a pagination params object for API requests.
 */
export function getPaginationParams(page: number, limit: number): { page: number; limit: number } {
  return { page, limit };
}
