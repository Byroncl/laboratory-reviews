import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinimizedModalService, MinimizedModal } from '../../services/minimized-modal.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-minimized-modals-tray',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-0 left-0 right-0 flex gap-2 p-4 bg-white border-t border-gray-200 shadow-lg" *ngIf="(minimizedModals$ | async)?.length">
      @for (modal of minimizedModals$ | async; track modal.id) {
        <button
          (click)="restoreModal.emit(modal.id)"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition-colors flex items-center gap-2 min-w-max"
        >
          <span class="text-sm">{{ modal.title }}</span>
          <span class="text-xs bg-white/20 px-2 py-0.5 rounded">↑</span>
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MinimizedModalsTrayComponent implements OnInit {
  minimizedModals$!: Observable<MinimizedModal[]>;

  @Output() restoreModal = new EventEmitter<string>();

  constructor(private minimizedModalService: MinimizedModalService) {}

  ngOnInit(): void {
    this.minimizedModals$ = this.minimizedModalService.minimizedModals$;
  }
}
