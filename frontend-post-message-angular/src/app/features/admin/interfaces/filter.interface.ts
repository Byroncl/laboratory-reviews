export interface IFilterOption {
  value: string;
  label: string;
}

export interface ITableFilter {
  field: string;
  operator: 'eq' | 'contains' | 'startsWith' | 'gt' | 'lt';
  value: string;
}

export interface IUserFilters {
  searchTerm?: string;
  role?: string;
  status?: string;
}

export interface IRoleFilters {
  searchTerm?: string;
  name?: string;
}

export interface IPermissionFilters {
  searchTerm?: string;
  action?: string;
  resource?: string;
}

export interface IAuditLogFilters {
  searchTerm?: string;
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
