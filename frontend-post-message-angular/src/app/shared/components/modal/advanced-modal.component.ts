import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../services/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-advanced-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (currentModal) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center"
        (click)="onBackdropClick()"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          aria-hidden="true"
        ></div>

        <!-- Modal Container -->
        <div
          class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all"
          (click)="$event.stopPropagation()"
          role="dialog"
          [attr.aria-labelledby]="'modal-title-' + currentModal.id"
          aria-modal="true"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2
              [id]="'modal-title-' + currentModal.id"
              class="text-lg font-semibold text-primary"
            >
              {{ currentModal.title }}
            </h2>
            <div class="flex items-center gap-1">
              <button
                type="button"
                (click)="toggleMinimize()"
                class="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                [attr.aria-label]="isMinimized ? 'Expand modal' : 'Minimize modal'"
              >
                <span class="text-base leading-none select-none">{{ isMinimized ? '▲' : '▼' }}</span>
              </button>
              <button
                type="button"
                (click)="onCancel()"
                class="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                [attr.aria-label]="'Close ' + currentModal.title"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Collapsible body + footer -->
          <div class="modal-collapsible" [class.modal-collapsed]="isMinimized">
            <!-- Body -->
            <div class="px-6 py-4">
              @if (currentModal.message) {
                <p class="text-gray-600 text-sm leading-relaxed">
                  {{ currentModal.message }}
                </p>
              }
              @if (currentModal.template) {
                <ng-container [ngTemplateOutlet]="currentModal.template"></ng-container>
              }
            </div>

            <!-- Footer -->
            <div class="flex gap-3 justify-end px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                {{ currentModal.cancelText || 'Cancelar' }}
              </button>
              <button
                type="button"
                (click)="onConfirm()"
                [class]="
                  currentModal.isDangerous
                    ? 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm'
                    : 'px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition-colors font-medium text-sm'
                "
              >
                {{ currentModal.confirmText || 'Confirmar' }}
              </button>
            </div>
          </div>

          <!-- Loading Overlay -->
          @if (isProcessing) {
            <div class="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
              <div class="animate-spin">
                <svg
                  class="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    .modal-collapsible {
      overflow: hidden;
      max-height: 600px;
      opacity: 1;
      transition:
        max-height 0.3s ease,
        opacity 0.2s ease;
    }

    .modal-collapsed {
      max-height: 0;
      opacity: 0;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `]
})
export class AdvancedModalComponent implements OnInit, OnDestroy {
  currentModal: ModalConfig | null = null;
  isProcessing = false;
  isMinimized = false;

  private destroy$ = new Subject<void>();

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.activeModal
      .pipe(takeUntil(this.destroy$))
      .subscribe(modal => {
        this.currentModal = modal;
        // Reset minimized state when a new modal opens
        if (modal) {
          this.isMinimized = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  onConfirm(): void {
    if (!this.currentModal) return;

    this.isProcessing = true;
    setTimeout(() => {
      this.modalService.confirm(this.currentModal!.id);
      this.isProcessing = false;
    }, 300);
  }

  onCancel(): void {
    if (!this.currentModal) return;

    this.modalService.cancel(this.currentModal.id);
  }

  onBackdropClick(): void {
    this.onCancel();
  }
}
