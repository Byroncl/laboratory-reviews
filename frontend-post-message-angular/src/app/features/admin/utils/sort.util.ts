/**
 * Generic sort function for any entity
 */
export function sortByField<T>(
  items: T[],
  sortBy: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    // Handle strings
    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();

    return order === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  return sorted;
}

/**
 * Multi-field sort
 */
export function sortByFields<T>(
  items: T[],
  sortConfig: Array<{ field: keyof T; order: 'asc' | 'desc' }>
): T[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    for (const { field, order } of sortConfig) {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === bVal) continue;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();

      const comparison = aStr.localeCompare(bStr);
      return order === 'asc' ? comparison : -comparison;
    }

    return 0;
  });

  return sorted;
}

/**
 * Toggle sort order (asc -> desc -> asc)
 */
export function toggleSortOrder(current: 'asc' | 'desc'): 'asc' | 'desc' {
  return current === 'asc' ? 'desc' : 'asc';
}
