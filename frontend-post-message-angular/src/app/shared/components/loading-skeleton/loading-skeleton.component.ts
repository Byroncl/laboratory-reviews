import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      @for (item of items; track item) {
        <div class="animate-pulse">
          <div class="h-20 bg-gray-300 rounded-lg"></div>
        </div>
      }
    </div>
  `,
})
export class LoadingSkeletonComponent {
  @Input() set count(value: number) {
    this.items = Array.from({ length: value }, (_, i) => i);
  }
  items: number[] = Array.from({ length: 5 }, (_, i) => i);
}
