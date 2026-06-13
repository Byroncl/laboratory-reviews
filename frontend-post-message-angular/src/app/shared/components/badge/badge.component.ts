import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClass">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';

  get badgeClass(): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variants: Record<BadgeVariant, string> = {
      primary: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-gray-100 text-gray-800'
    };
    return `${baseClass} ${variants[this.variant]}`;
  }
}
