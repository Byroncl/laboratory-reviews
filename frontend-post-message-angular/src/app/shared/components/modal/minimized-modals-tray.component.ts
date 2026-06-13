import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinimizedModalService, MinimizedModal } from '../../services/minimized-modal.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-minimized-modals-tray',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if ((minimizedModals$ | async)?.length) {
      <div class="fixed bottom-0 left-0 right-0 flex gap-2 p-4 bg-white border-t border-gray-200 shadow-lg z-40 animate-in slide-in-from-bottom-2 duration-300">
        @for (modal of minimizedModals$ | async; track modal.id) {
          <button
            (click)="restoreModal(modal.id)"
            [attr.aria-label]="'Restore ' + modal.title"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition-all duration-200 flex items-center gap-2 min-w-max hover:shadow-md"
          >
            <span class="text-sm font-medium">{{ modal.title }}</span>
            <span class="text-xs bg-white/20 px-2 py-0.5 rounded inline-flex items-center">↑</span>
          </button>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MinimizedModalsTrayComponent implements OnInit {
  minimizedModals$!: Observable<MinimizedModal[]>;

  constructor(private minimizedModalService: MinimizedModalService) {}

  ngOnInit(): void {
    this.minimizedModals$ = this.minimizedModalService.minimizedModals$;
  }

  /**
   * Restaura un modal minimizado
   * @param modalId ID del modal a restaurar
   */
  restoreModal(modalId: string): void {
    this.minimizedModalService.restoreMinimized(modalId, true);
  }
}
