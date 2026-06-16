import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

export interface Permission {
  id: string;
  name: string;
  identifier: string;
  type: string;
}

export interface UserRole {
  id: string;
  name: string;
  identifier: string;
  permissions: Permission[];
}

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  userRole = signal<UserRole | null>(null);
  userPermissions = signal<string[]>([]);

  canAccess = computed(() => {
    return (permissionIdentifier: string) => {
      return this.userPermissions().includes(permissionIdentifier);
    };
  });

  hasRole = computed(() => {
    return (roleIdentifier: string) => {
      return this.userRole()?.identifier === roleIdentifier;
    };
  });

  setUserRole(role: UserRole | null): void {
    this.userRole.set(role);
    if (role?.permissions) {
      const permissionIds = role.permissions.map(p => p.identifier);
      this.userPermissions.set(permissionIds);
    } else {
      this.userPermissions.set([]);
    }
  }

  hasPermission(permissionIdentifier: string): boolean {
    return this.userPermissions().includes(permissionIdentifier);
  }

  hasAnyPermission(permissionIdentifiers: string[]): boolean {
    return permissionIdentifiers.some(p => this.hasPermission(p));
  }

  hasAllPermissions(permissionIdentifiers: string[]): boolean {
    return permissionIdentifiers.every(p => this.hasPermission(p));
  }

  isAdmin(): boolean {
    const identifier = this.userRole()?.identifier;
    return identifier === 'admin' || identifier === 'moderator';
  }

  isClient(): boolean {
    return this.userRole()?.identifier === 'client';
  }

  clear(): void {
    this.userRole.set(null);
    this.userPermissions.set([]);
  }
}
