export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

export function canGoToNextPage(currentPage: number, totalPages: number): boolean {
  return currentPage < totalPages;
}

export function canGoToPreviousPage(currentPage: number): boolean {
  return currentPage > 1;
}
