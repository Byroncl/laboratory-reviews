import { Pipe, PipeTransform } from '@angular/core';
import { IUserProfile } from '../interfaces';

/**
 * Formats a user profile into a display badge string: "Name Lastname (role)".
 * Matching the PostStatusPipe standalone pattern from the posts module.
 */
@Pipe({
  name: 'userBadge',
  standalone: true,
})
export class UserBadgePipe implements PipeTransform {
  transform(user: IUserProfile | null | undefined): string {
    if (!user) return '';
    const name = `${user.name} ${user.lastname}`.trim();
    const role = user.role ? ` (${user.role})` : '';
    return `${name}${role}`;
  }
}
