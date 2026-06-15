import { User, Role, Permission } from '../../../shared/models';

export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type TableActionId = 'view' | 'edit' | 'delete' | 'toggle-status' | 'assign';

export type AdminEntity = User | Role | Permission;

// Discriminated union for admin actions
export type AdminAction =
  | { type: 'CREATE_USER'; payload: Omit<User, '_id' | 'id'> }
  | { type: 'UPDATE_USER'; payload: { id: string; data: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ACTIVATE_USER'; payload: string }
  | { type: 'DEACTIVATE_USER'; payload: string }
  | { type: 'ASSIGN_ROLE'; payload: { userId: string; roleId: string } }
  | { type: 'CREATE_ROLE'; payload: Omit<Role, '_id' | 'id'> }
  | { type: 'UPDATE_ROLE'; payload: { id: string; data: Partial<Role> } }
  | { type: 'DELETE_ROLE'; payload: string }
  | { type: 'ASSIGN_PERMISSIONS'; payload: { roleId: string; permissionIds: string[] } };

export interface AdminTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  template?: boolean;
  width?: string;
}

export interface AdminTableAction {
  id: TableActionId;
  label: string;
  icon: string;
  class: string;
  confirm?: boolean;
  confirmMessage?: string;
}

export interface PaginationState {
  skip: number;
  limit: number;
  total: number;
}

export interface FilterState {
  searchTerm: string;
  roleFilter?: string;
  statusFilter?: string;
  columnFilters?: Record<string, string>;
}
