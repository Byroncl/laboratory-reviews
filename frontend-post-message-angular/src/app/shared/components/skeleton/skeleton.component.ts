import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SkeletonType = 'text' | 'avatar' | 'card' | 'table' | 'chart';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('text') {
        <div class="space-y-3">
          @for (i of rows; track i) {
            <div [class]="skeletonClass" [style.width]="i === rows.length ? '70%' : '100%'"></div>
          }
        </div>
      }
      @case ('avatar') {
        <div class="w-12 h-12 rounded-full skeleton-loading"></div>
      }
      @case ('card') {
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div class="h-4 rounded skeleton-loading w-1/4"></div>
          <div class="space-y-2">
            <div class="h-3 rounded skeleton-loading"></div>
            <div class="h-3 rounded skeleton-loading w-5/6"></div>
          </div>
        </div>
      }
      @case ('table') {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="divide-y">
            @for (i of [1,2,3]; track i) {
              <div class="px-6 py-4 space-y-2">
                <div class="flex gap-4">
                  <div class="h-4 rounded skeleton-loading flex-1"></div>
                  <div class="h-4 rounded skeleton-loading flex-1"></div>
                  <div class="h-4 rounded skeleton-loading flex-1"></div>
                </div>
              </div>
            }
          </div>
        </div>
      }
      @case ('chart') {
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div class="h-4 rounded skeleton-loading w-1/4"></div>
          <div class="h-64 rounded skeleton-loading"></div>
        </div>
      }
    }
  `,
  styles: [`
    .skeleton-loading {
      @apply bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse;
    }
  `]
})
export class SkeletonComponent {
  @Input() type: SkeletonType = 'text';
  @Input() rows = [1, 2, 3];

  get skeletonClass(): string {
    return 'h-4 rounded skeleton-loading';
  }
}
