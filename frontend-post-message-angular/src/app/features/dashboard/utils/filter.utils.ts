import { User, Post, AuditLog } from '../types';

export function filterUsersBySearch(users: User[], searchTerm: string): User[] {
  if (!searchTerm) return users;
  const lower = searchTerm.toLowerCase();
  return users.filter(u =>
    u.name.toLowerCase().includes(lower) ||
    u.lastname.toLowerCase().includes(lower) ||
    u.email.toLowerCase().includes(lower) ||
    u.username.toLowerCase().includes(lower)
  );
}

export function filterUsersByStatus(users: User[], status: string | null): User[] {
  if (!status) return users;
  return users.filter(u => u.status === status);
}

export function filterUsersByType(users: User[], type: string | null): User[] {
  if (!type) return users;
  return users.filter(u => u.type === type);
}

export function filterPostsBySearch(posts: Post[], searchTerm: string): Post[] {
  if (!searchTerm) return posts;
  const lower = searchTerm.toLowerCase();
  return posts.filter(p =>
    p.title.toLowerCase().includes(lower) ||
    p.body.toLowerCase().includes(lower) ||
    p.author.toLowerCase().includes(lower)
  );
}

export function filterPostsByStatus(posts: Post[], status: string | null): Post[] {
  if (!status) return posts;
  return posts.filter(p => p.status === status);
}

export function filterAuditLogsBySearch(logs: AuditLog[], searchTerm: string): AuditLog[] {
  if (!searchTerm) return logs;
  const lower = searchTerm.toLowerCase();
  return logs.filter(log =>
    log.userName.toLowerCase().includes(lower) ||
    log.entityId.toLowerCase().includes(lower)
  );
}

export function filterAuditLogsByAction(logs: AuditLog[], action: string | null): AuditLog[] {
  if (!action) return logs;
  return logs.filter(log => log.action === action);
}

export function filterAuditLogsByEntityType(logs: AuditLog[], entityType: string | null): AuditLog[] {
  if (!entityType) return logs;
  return logs.filter(log => log.entityType === entityType);
}

export function filterAuditLogsByDateRange(logs: AuditLog[], fromDate: Date | null, toDate: Date | null): AuditLog[] {
  if (!fromDate && !toDate) return logs;
  return logs.filter(log => {
    const logDate = new Date(log.createdAt);
    if (fromDate && logDate < fromDate) return false;
    if (toDate && logDate > toDate) return false;
    return true;
  });
}
