import { Directive, Output, EventEmitter, HostBinding, Input } from '@angular/core';

/**
 * Directiva reutilizable que permite minimizar cualquier componente modal.
 * Se aplica al contenedor principal del modal.
 *
 * @example
 * <app-my-modal appMinimizable (minimized)="onMinimize($event)" (restored)="onRestore($event)">
 */
@Directive({
  selector: '[appMinimizable]',
  standalone: true
})
export class MinimizableModalDirective {
  /**
   * Indica si el modal está minimizado
   */
  @Input() isMinimized = false;

  /**
   * Emite cuando el modal se minimiza. Retorna {id, title}
   */
  @Output() minimized = new EventEmitter<{ id: string; title: string }>();

  /**
   * Emite cuando el modal se restaura. Retorna el ID del modal
   */
  @Output() restored = new EventEmitter<string>();

  /**
   * Clase que oculta el modal cuando está minimizado
   */
  @HostBinding('class.minimizable-minimized')
  get isMinimizedClass(): boolean {
    return this.isMinimized;
  }

  /**
   * Minimiza el modal
   * @param id ID único del modal
   * @param title Título del modal para mostrar en la bandeja
   */
  minimize(id: string, title: string): void {
    this.isMinimized = true;
    this.minimized.emit({ id, title });
  }

  /**
   * Restaura el modal
   * @param id ID único del modal
   */
  restore(id: string): void {
    this.isMinimized = false;
    this.restored.emit(id);
  }

  /**
   * Alterna entre minimizado y restaurado
   * @param id ID único del modal
   * @param title Título del modal
   */
  toggle(id: string, title: string): void {
    if (this.isMinimized) {
      this.restore(id);
    } else {
      this.minimize(id, title);
    }
  }
}
