import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MinimizedModal {
  id: string;
  title: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MinimizedModalService {
  private minimizedModals = new BehaviorSubject<MinimizedModal[]>([]);
  public minimizedModals$ = this.minimizedModals.asObservable();

  addMinimized(modal: MinimizedModal): void {
    const current = this.minimizedModals.value;
    this.minimizedModals.next([...current, modal]);
  }

  removeMinimized(modalId: string): void {
    const current = this.minimizedModals.value;
    this.minimizedModals.next(current.filter(m => m.id !== modalId));
  }

  getMinimized(): MinimizedModal[] {
    return this.minimizedModals.value;
  }

  clear(): void {
    this.minimizedModals.next([]);
  }
}
