import { Component, signal, computed, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import {
  TableComponent,
  TableColumn,
  TableAction,
  PaginationComponent,
  BadgeComponent,
  SpinnerComponent,
  SkeletonComponent
} from '../../../shared/components/index';
import { ModalService, NotificationService } from '../../../shared/services/index';
import { I18nService } from '../../../core/services/i18n.service';
import { CommentsAdminService, Comment } from '../../admin/services/comments.service';
import { extractId, filterBySearchTerm, sortByField, applyColumnFilters } from '../../admin';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss'
})
export class CommentsComponent {
  readonly pageSize = 10;
  readonly destroyRef = inject(DestroyRef);

  // State signals
  readonly globalSearch$ = signal('');
  readonly statusFilter$ = signal('');
  readonly postFilter$ = signal('');
  readonly authorFilter$ = signal('');
  readonly hasActiveFilters$ = signal(false);

  // Stats signals
  readonly totalCommentsCount = signal(0);
  readonly activeCount = signal(0);
  readonly deletedCount = signal(0);

  // Filters state
  private columnFilters$ = signal<Record<string, string>>({});
  private sortState$ = signal<{ sortBy?: string; sortOrder: 'asc' | 'desc' }>({
    sortOrder: 'asc'
  });

  // Computed filtered comments
  readonly filteredComments = computed(() => {
    const comments = this.commentsService.comments$();

    let filtered = comments.filter(c => {
      if (this.statusFilter$() === 'active' && !c.isActive) return false;
      if (this.statusFilter$() === 'deleted' && !c.isDeleted) return false;
      if (this.statusFilter$() === 'inactive' && c.isActive) return false;
      if (this.postFilter$() && c.postId !== this.postFilter$()) return false;
      if (this.authorFilter$() && c.author !== this.authorFilter$()) return false;
      return true;
    });

    // Apply global search
    if (this.globalSearch$()) {
      filtered = filtered.filter(c =>
        c.content?.toLowerCase().includes(this.globalSearch$().toLowerCase()) ||
        c.author?.toLowerCase().includes(this.globalSearch$().toLowerCase()) ||
        c.postId?.includes(this.globalSearch$())
      );
    }

    // Apply column filters
    filtered = applyColumnFilters(filtered, this.columnFilters$());

    // Apply sorting
    if (this.sortState$().sortBy) {
      filtered = sortByField(
        filtered,
        this.sortState$().sortBy as keyof Comment,
        this.sortState$().sortOrder
      );
    }

    return filtered;
  });

  readonly columns: TableColumn[] = [
    { key: 'author', label: 'Author', sortable: true, filterable: true },
    { key: 'content', label: 'Content', sortable: true, filterable: true },
    { key: 'postId', label: 'Post ID', sortable: true },
    { key: 'isActive', label: 'Status', template: true, sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true }
  ];

  get actions(): TableAction[] {
    return [
      { id: 'view', label: 'View', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
      {
        id: 'toggle-status',
        label: 'Toggle Status',
        icon: 'edit',
        class: 'text-orange-600 hover:text-orange-700'
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'delete',
        class: 'text-red-600 hover:text-red-700',
        confirm: true,
        confirmMessage: this.i18n.translate('dashboard.comments.deleteConfirmBody')
      }
    ];
  }

  constructor(
    readonly commentsService: CommentsAdminService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {
    this.loadCurrentPage();
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const comment = event.row as unknown as Comment;

    switch (event.action) {
      case 'view':
        this.viewComment(comment);
        break;
      case 'toggle-status':
        this.toggleCommentStatus(comment);
        break;
      case 'delete':
        this.deleteComment(comment);
        break;
    }
  }

  viewComment(comment: Comment): void {
    const statusText = comment.isDeleted ? 'Deleted' : (comment.isActive ? 'Active' : 'Inactive');
    this.modalService
      .openConfirm(
        `Comment by ${comment.author}`,
        `Content: ${comment.content}\nPost ID: ${comment.postId}\nStatus: ${statusText}\nCreated: ${comment.createdAt}`
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  toggleCommentStatus(comment: Comment): void {
    const newStatus = !comment.isActive;
    const commentId = extractId(comment);

    this.commentsService.toggleCommentStatus(commentId, newStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const statusMsg = newStatus ? 'activated' : 'deactivated';
        this.notificationService.toast(
          this.i18n.translate('dashboard.comments.toggleSuccess').replace('{status}', statusMsg),
          'success'
        );
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast(this.i18n.translate('dashboard.comments.toggleError'), 'error');
      }
    });
  }

  deleteComment(comment: Comment): void {
    this.modalService
      .openConfirm(
        this.i18n.translate('dashboard.comments.deleteConfirmTitle'),
        this.i18n.translate('dashboard.comments.deleteConfirmBody').replace('{content}', comment.content),
        true
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.confirmed) {
          const commentId = extractId(comment);
          this.commentsService.deleteComment(commentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
              this.updateStats();
              this.notificationService.toast(this.i18n.translate('dashboard.comments.deleteSuccess'), 'success');
            },
            error: () => {
              this.notificationService.toast(this.i18n.translate('dashboard.comments.deleteError'), 'error');
            }
          });
        }
      });
  }

  onGlobalSearch(): void {
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onStatusFilterChange(): void {
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onPostFilterChange(): void {
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onAuthorFilterChange(): void {
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onColumnFilter(filters: Array<{ column: string; value: string }>): void {
    const filterMap: Record<string, string> = {};
    filters.forEach(filter => {
      filterMap[filter.column] = filter.value;
    });
    this.columnFilters$.set(filterMap);
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    this.sortState$.set({ sortBy: event.sortBy, sortOrder: event.sortOrder });
  }

  onPageChange(page: number): void {
    const skip = (page - 1) * this.pageSize;
    this.loadCommentsWithFilters(skip);
  }

  clearAllFilters(): void {
    this.globalSearch$.set('');
    this.statusFilter$.set('');
    this.postFilter$.set('');
    this.authorFilter$.set('');
    this.columnFilters$.set({});
    this.updateActiveFilters();
    this.loadCurrentPage();
  }

  private loadCurrentPage(): void {
    const { skip } = this.commentsService.pagination();
    this.loadCommentsWithFilters(skip);
  }

  private loadCommentsWithFilters(skip: number): void {
    this.commentsService.loadComments(skip, this.pageSize).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast(this.i18n.translate('dashboard.comments.loadError'), 'error');
      }
    });
  }

  private updateStats(): void {
    const comments = this.commentsService.comments$();
    this.totalCommentsCount.set(comments.length);
    this.activeCount.set(comments.filter(c => c.isActive).length);
    this.deletedCount.set(comments.filter(c => c.isDeleted).length);
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters$.set(
      this.globalSearch$() !== '' ||
      this.statusFilter$() !== '' ||
      this.postFilter$() !== '' ||
      this.authorFilter$() !== '' ||
      Object.keys(this.columnFilters$()).length > 0
    );
  }
}
