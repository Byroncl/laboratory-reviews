import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 space-y-2 z-50">
      @for (toast of toastService.toasts$(); track toast.id) {
        <div
          [ngClass]="{
            'bg-green-500': toast.type === 'success',
            'bg-red-500': toast.type === 'error',
            'bg-blue-500': toast.type === 'info'
          }"
          class="text-white px-4 py-3 rounded shadow-lg flex items-center justify-between min-w-64"
          [@slideIn]
        >
          <span>{{ toast.message }}</span>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="ml-4 font-bold text-lg hover:opacity-70"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))]),
    ]),
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
