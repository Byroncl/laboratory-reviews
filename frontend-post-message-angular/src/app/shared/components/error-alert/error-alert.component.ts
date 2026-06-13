import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div class="flex">
          <div class="text-red-500 mr-3">⚠️</div>
          <div>
            <h3 class="font-semibold text-red-800">Error</h3>
            <p class="text-red-700 text-sm">{{ message }}</p>
          </div>
        </div>
      </div>
    }
  `,
})
export class ErrorAlertComponent {
  @Input() message: string | null = null;
}
