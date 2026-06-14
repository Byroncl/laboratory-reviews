import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          (click)="onClose()"
        ></div>

        <!-- Modal -->
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 sm:block sm:p-0">
          <div
            class="relative inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:max-w-lg"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 class="text-lg font-medium text-primary">{{ title }}</h3>
              <button
                (click)="onClose()"
                class="text-gray-400 hover:text-gray-600 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4">
              <ng-container *ngTemplateOutlet="content"></ng-container>
            </div>

            <!-- Footer -->
            @if (showFooter) {
              <div class="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  (click)="onClose()"
                  class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  (click)="onConfirm()"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition text-sm font-medium"
                >
                  {{ confirmText }}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal';
  @Input() showFooter = true;
  @Input() confirmText = 'Confirmar';
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @ContentChild('content') content!: TemplateRef<any>;

  onClose(): void {
    this.closed.emit();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }
}
