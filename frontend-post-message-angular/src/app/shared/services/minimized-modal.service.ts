import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

/**
 * Representa un modal minimizado en la bandeja
 */
export interface MinimizedModal {
  id: string;
  title: string;
  icon?: string;
  timestamp: number;
}

/**
 * Evento de restauración de modal
 */
export interface RestoreModalEvent {
  id: string;
  shouldFocus: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MinimizedModalService {
  private minimizedModals = new BehaviorSubject<MinimizedModal[]>([]);
  private restoreRequest$ = new Subject<RestoreModalEvent>();

  public minimizedModals$ = this.minimizedModals.asObservable();
  public restoreRequest = this.restoreRequest$.asObservable();

  /**
   * Agrega un modal a la lista de minimizados
   * @param modal Información del modal a minimizar
   */
  addMinimized(modal: Omit<MinimizedModal, 'timestamp'>): void {
    const current = this.minimizedModals.value;
    const newModal: MinimizedModal = {
      ...modal,
      timestamp: Date.now()
    };
    this.minimizedModals.next([...current, newModal]);
  }

  /**
   * Remueve un modal de la lista de minimizados
   * @param modalId ID del modal a remover
   */
  removeMinimized(modalId: string): void {
    const current = this.minimizedModals.value;
    this.minimizedModals.next(current.filter(m => m.id !== modalId));
  }

  /**
   * Restaura un modal minimizado y lo trae al frente
   * @param modalId ID del modal a restaurar
   * @param shouldFocus Si true, enfoca el modal restaurado
   */
  restoreMinimized(modalId: string, shouldFocus = true): void {
    this.removeMinimized(modalId);
    this.restoreRequest$.next({ id: modalId, shouldFocus });
  }

  /**
   * Obtiene todos los modales minimizados
   */
  getMinimized(): MinimizedModal[] {
    return this.minimizedModals.value;
  }

  /**
   * Verifica si un modal está minimizado
   * @param modalId ID del modal a verificar
   */
  isMinimized(modalId: string): boolean {
    return this.minimizedModals.value.some(m => m.id === modalId);
  }

  /**
   * Limpia todos los modales minimizados
   */
  clear(): void {
    this.minimizedModals.next([]);
  }
}
