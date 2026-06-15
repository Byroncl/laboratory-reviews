import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { IPagination } from '../../interfaces';
import {
  calculateCurrentPage,
  calculateTotalPages,
  canGoToNextPage,
  canGoToPreviousPage,
} from '../../utils';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent {
  @Input() pagination!: IPagination;
  @Input() isLoading = false;
  @Output() nextPage = new EventEmitter<void>();
  @Output() prevPage = new EventEmitter<void>();

  get currentPage(): number {
    return calculateCurrentPage(this.pagination.skip, this.pagination.limit);
  }

  get totalPages(): number {
    return calculateTotalPages(this.pagination.total, this.pagination.limit);
  }

  get canGoNext(): boolean {
    return canGoToNextPage(this.pagination);
  }

  get canGoPrev(): boolean {
    return canGoToPreviousPage(this.pagination);
  }

  onNextPage(): void {
    if (this.canGoNext) {
      this.nextPage.emit();
    }
  }

  onPrevPage(): void {
    if (this.canGoPrev) {
      this.prevPage.emit();
    }
  }
}
