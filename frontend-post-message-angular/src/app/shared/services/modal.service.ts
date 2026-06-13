import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TemplateRef } from '@angular/core';

export interface ModalConfig {
  id: string;
  title: string;
  message?: string;
  template?: TemplateRef<unknown> | null;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  data?: unknown;
}

export interface ModalResult {
  confirmed: boolean;
  data?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalsStack: ModalConfig[] = [];
  private activeModal$ = new BehaviorSubject<ModalConfig | null>(null);
  private modalResult$ = new BehaviorSubject<ModalResult | null>(null);
  private resolveCallbacks = new Map<string, (result: ModalResult) => void>();

  public activeModal = this.activeModal$.asObservable();

  openConfirm(title: string, message: string, isDangerous = false): Observable<ModalResult> {
    return new Observable(observer => {
      const id = `confirm-${Date.now()}-${Math.random()}`;
      const config: ModalConfig = {
        id,
        title,
        message,
        confirmText: isDangerous ? 'Eliminar' : 'Confirmar',
        cancelText: 'Cancelar',
        isDangerous
      };

      this.modalsStack.push(config);
      this.activeModal$.next(config);

      this.resolveCallbacks.set(id, (result: ModalResult) => {
        observer.next(result);
        observer.complete();
        this.removeModal(id);
      });
    });
  }

  openForm(
    title: string,
    confirmText = 'Guardar',
    data?: unknown
  ): Observable<ModalResult> {
    return new Observable(observer => {
      const id = `form-${Date.now()}-${Math.random()}`;
      const config: ModalConfig = {
        id,
        title,
        confirmText,
        cancelText: 'Cancelar',
        data
      };

      this.modalsStack.push(config);
      this.activeModal$.next(config);

      this.resolveCallbacks.set(id, (result: ModalResult) => {
        observer.next(result);
        observer.complete();
        this.removeModal(id);
      });
    });
  }

  confirm(id: string, data?: unknown): void {
    const callback = this.resolveCallbacks.get(id);
    if (callback) {
      callback({ confirmed: true, data });
    }
  }

  cancel(id: string): void {
    const callback = this.resolveCallbacks.get(id);
    if (callback) {
      callback({ confirmed: false });
    }
  }

  close(): void {
    if (this.modalsStack.length > 0) {
      const currentModal = this.modalsStack[this.modalsStack.length - 1];
      this.cancel(currentModal.id);
    }
  }

  private removeModal(id: string): void {
    const index = this.modalsStack.findIndex(m => m.id === id);
    if (index > -1) {
      this.modalsStack.splice(index, 1);
      this.resolveCallbacks.delete(id);

      if (this.modalsStack.length > 0) {
        this.activeModal$.next(this.modalsStack[this.modalsStack.length - 1]);
      } else {
        this.activeModal$.next(null);
      }
    }
  }

  getCurrentModal(): ModalConfig | null {
    return this.activeModal$.value;
  }

  getStackSize(): number {
    return this.modalsStack.length;
  }
}
