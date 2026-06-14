import { IPagination } from './pagination.interface';
import { User, Role, Permission } from '../../../shared/models';

export interface IAdminState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  pagination: IPagination;
}

export interface IUserState extends IAdminState<User> {
  stats: IUserStats | null;
}

export interface IRoleState extends IAdminState<Role> {}

export interface IPermissionState extends IAdminState<Permission> {}

export interface IUserStats {
  total: number;
  active: number;
  admin: number;
  suspended: number;
}

export interface ITableState {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  columnFilters: Record<string, string>;
}
