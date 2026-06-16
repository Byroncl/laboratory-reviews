import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../shared/models/post.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-post-delete-confirm',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ 'dashboard.posts.deleteConfirmTitle' | t }}</h2>
          <p class="text-gray-500 text-sm mt-1">{{ 'dashboard.common.cannotUndone' | t }}</p>
        </div>
      </div>

      <!-- Post Info -->
      <div class="bg-red-50 rounded-lg border border-red-200 p-4">
        <p class="text-gray-700">
          {{ 'dashboard.posts.deleteConfirmBody' | t }}
        </p>
        <p class="text-gray-900 font-semibold mt-2">{{ post.title }}</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <button
          (click)="onCancel()"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          {{ 'dashboard.common.cancel' | t }}
        </button>
        <button
          (click)="onConfirm()"
          [disabled]="isLoading"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          @if (isLoading) {
            <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          }
          {{ 'dashboard.posts.delete' | t }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PostDeleteConfirmComponent {
  @Input() post!: Post;
  @Input() isLoading = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
