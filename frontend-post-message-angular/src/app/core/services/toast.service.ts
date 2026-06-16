import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number; // ms, 0 = no auto-dismiss
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts$ = signal<Toast[]>([]);

  private idCounter = 0;

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: Toast['type'], duration: number): void {
    const id = `toast-${++this.idCounter}`;
    const toast: Toast = { id, message, type, duration };

    this.toasts$.update(t => [...t, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this.toasts$.update(t => t.filter(x => x.id !== id));
  }

  dismissAll(): void {
    this.toasts$.set([]);
  }
}
