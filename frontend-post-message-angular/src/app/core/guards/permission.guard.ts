import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';

export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return () => {
    const permissionsService = inject(PermissionsService);
    const router = inject(Router);

    if (permissionsService.hasPermission(requiredPermission)) {
      return true;
    }

    router.navigate(['/client']);
    return false;
  };
};

export const dashboardGuard: CanActivateFn = (route, state) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  // Allow both admin and client to access dashboard
  // They'll see different content based on their role
  if (permissionsService.isAdmin() || permissionsService.isClient()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
