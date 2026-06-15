import { Pipe, PipeTransform } from '@angular/core';
import { USER_STATUSES } from '../constants';

export interface StatusBadgeConfig {
  color: string;
  icon: string;
  textColor?: string;
}

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  private statusMap: Record<string, StatusBadgeConfig> = {
    [USER_STATUSES.ACTIVE]: {
      color: 'bg-green-100',
      icon: '✓',
      textColor: 'text-green-700'
    },
    [USER_STATUSES.INACTIVE]: {
      color: 'bg-gray-100',
      icon: '○',
      textColor: 'text-gray-700'
    },
    [USER_STATUSES.SUSPENDED]: {
      color: 'bg-red-100',
      icon: '⊗',
      textColor: 'text-red-700'
    }
  };

  transform(status: string): StatusBadgeConfig {
    return this.statusMap[status] || this.statusMap[USER_STATUSES.INACTIVE];
  }
}
