import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="text-center py-12">
      <div class="text-4xl mb-4">{{ icon }}</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ title }}</h3>
      <p class="text-gray-500">{{ message }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'No items found';
  @Input() message = 'There are no items to display';
  @Input() icon = '📭';
}
