import { Pipe, PipeTransform } from '@angular/core';
import { USER_ROLES } from '../constants';

@Pipe({
  name: 'roleDisplay',
  standalone: true
})
export class RoleDisplayPipe implements PipeTransform {
  private roleMap: Record<string, { label: string; color: string }> = {
    [USER_ROLES.ADMIN]: {
      label: 'Administrador',
      color: 'text-red-600'
    },
    [USER_ROLES.EDITOR]: {
      label: 'Editor',
      color: 'text-blue-600'
    },
    [USER_ROLES.VIEWER]: {
      label: 'Visualizador',
      color: 'text-gray-600'
    }
  };

  transform(role: string): { label: string; color: string } {
    return this.roleMap[role] || { label: role, color: 'text-gray-600' };
  }
}
