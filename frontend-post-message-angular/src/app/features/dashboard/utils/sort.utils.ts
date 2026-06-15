export function sortByField<T>(items: T[], field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function toggleSortOrder(current: 'asc' | 'desc'): 'asc' | 'desc' {
  return current === 'asc' ? 'desc' : 'asc';
}
