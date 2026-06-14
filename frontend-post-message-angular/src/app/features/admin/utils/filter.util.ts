import { IUserFilters, IRoleFilters } from '../interfaces';

/**
 * Generic filter function - search multiple fields
 */
export function filterBySearchTerm<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = String(item[field] || '').toLowerCase();
      return value.includes(term);
    })
  );
}

/**
 * Filter users by multiple criteria
 */
export function filterUsers<T extends { name?: string; email?: string; role?: string; status?: string }>(
  users: T[],
  filters: IUserFilters
): T[] {
  return users.filter(user => {
    // Search term in name or email
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Role filter
    if (filters.role && user.role !== filters.role) {
      return false;
    }

    // Status filter
    if (filters.status && user.status !== filters.status) {
      return false;
    }

    return true;
  });
}

/**
 * Filter permissions by name
 */
export function filterPermissions<T extends { name?: string }>(
  permissions: T[],
  filters: { searchTerm?: string }
): T[] {
  return permissions.filter(permission => {
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch = permission.name?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    return true;
  });
}

/**
 * Filter roles by name
 */
export function filterRoles<T extends { name?: string }>(
  roles: T[],
  filters: IRoleFilters
): T[] {
  return roles.filter(role => {
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch = role.name?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    if (filters.name && role.name !== filters.name) {
      return false;
    }

    return true;
  });
}

/**
 * Apply column-level filters
 */
export function applyColumnFilters<T>(
  items: T[],
  columnFilters: Record<string, string>
): T[] {
  return items.filter(item =>
    Object.entries(columnFilters).every(([column, filterValue]) => {
      const cellValue = String(item[column as keyof T] || '').toLowerCase();
      return cellValue.includes(filterValue.toLowerCase());
    })
  );
}
