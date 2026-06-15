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

  // Dashboard is for admins/users only. Clients go to /home
  if (permissionsService.isAdmin()) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
