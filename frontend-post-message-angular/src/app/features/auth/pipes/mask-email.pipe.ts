import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskEmail',
  standalone: true
})
export class MaskEmailPipe implements PipeTransform {
  /**
   * Mask email to show only first and last character of local part
   * Example: user@example.com → u***@example.com
   */
  transform(email: string): string {
    if (!email || !email.includes('@')) return email;

    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return email; // Don't mask if too short
    }

    const masked = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
    return `${masked}@${domain}`;
  }
}
