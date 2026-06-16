import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { IPostFilters } from '../../interfaces';
import { STATUS_FILTER_OPTIONS } from '../../constants';
import { debounceTime, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-post-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './post-filter.component.html',
  styleUrls: ['./post-filter.component.css'],
})
export class PostFilterComponent implements OnInit, OnDestroy {
  @Input() isLoading = false;
  @Output() filterChange = new EventEmitter<IPostFilters>();
  @Output() reset = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  filterForm!: FormGroup;
  statusOptions = STATUS_FILTER_OPTIONS;

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      author: [''],
      status: [''],
      tags: [''],
      dateFrom: [''],
      dateTo: [''],
    });

    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe((values) => {
        const parsedTags: string[] = values.tags
          ? values.tags
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [];

        const filters: IPostFilters = {
          searchTerm: values.searchTerm || undefined,
          author: values.author || undefined,
          status: values.status || undefined,
          tags: parsedTags.length > 0 ? parsedTags : undefined,
          dateFrom: values.dateFrom ? new Date(values.dateFrom) : undefined,
          dateTo: values.dateTo ? new Date(values.dateTo) : undefined,
        };
        this.filterChange.emit(filters);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onReset(): void {
    this.filterForm.reset();
    this.reset.emit();
  }
}
