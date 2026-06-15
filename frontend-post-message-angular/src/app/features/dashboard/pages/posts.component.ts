import { Component, signal, computed } from '@angular/core';
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
import { PostsService } from '../../posts/services/posts.service';
import { Post } from '../../../shared/models/post.model';
import { PostFormComponent } from '../components/post-form/post-form.component';
import { BulkPostUploadComponent } from '../components/bulk-post-upload/bulk-post-upload.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    TableComponent,
    PaginationComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent,
    PostFormComponent,
    BulkPostUploadComponent
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent {
  readonly pageSize = 10;

  // State signals
  readonly showPostForm$ = signal(false);
  readonly showBulkUpload$ = signal(false);
  readonly editingPostId$ = signal<string | null>(null);
  readonly globalSearch$ = signal('');
  readonly statusFilter$ = signal('');
  readonly hasActiveFilters$ = signal(false);
  readonly currentPage$ = signal(1);

  // Stats signals
  readonly totalPostsCount$ = signal(0);
  readonly publishedCount$ = signal(0);
  readonly draftCount$ = signal(0);

  // Private filter/sort state
  private readonly columnFilters$ = signal<Record<string, string>>({});
  private readonly sortState$ = signal<{ sortBy?: string; sortOrder: 'asc' | 'desc' }>({
    sortOrder: 'asc'
  });

  // Computed filtered posts
  readonly filteredPosts = computed(() => {
    const posts = this.postsService.posts$();
    const search = this.globalSearch$().toLowerCase();
    const status = this.statusFilter$();
    const colFilters = this.columnFilters$();

    let filtered = posts.filter(post => {
      if (search && !post.title.toLowerCase().includes(search) && !post.author.toLowerCase().includes(search)) {
        return false;
      }
      if (status && post.status !== status) {
        return false;
      }
      for (const [col, val] of Object.entries(colFilters)) {
        const cellVal = String(post[col as keyof Post] || '').toLowerCase();
        if (!cellVal.includes(val.toLowerCase())) return false;
      }
      return true;
    });

    const { sortBy, sortOrder } = this.sortState$();
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortBy as keyof Post];
        const bVal = b[sortBy as keyof Post];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal ?? '').toLowerCase();
        const bStr = String(bVal ?? '').toLowerCase();
        return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return filtered;
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredPosts().length / this.pageSize)
  );

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Título', sortable: true, filterable: true },
    { key: 'author', label: 'Autor', sortable: true, filterable: true },
    { key: 'status', label: 'Estado', template: true, filterable: true },
    { key: 'views', label: 'Vistas', sortable: true },
    { key: 'createdAt', label: 'Creado', sortable: true }
  ];

  get actions(): TableAction[] {
    return [
      { id: 'view', label: 'Ver', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
      { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
      { id: 'publish', label: 'Publicar', icon: 'publish', class: 'text-green-600 hover:text-green-700' },
      { id: 'archive', label: 'Archivar', icon: 'archive', class: 'text-orange-600 hover:text-orange-700' },
      {
        id: 'delete',
        label: 'Eliminar',
        icon: 'delete',
        class: 'text-red-600 hover:text-red-700',
        confirm: true,
        confirmMessage: this.i18n.translate('dashboard.posts.deleteConfirmBody')
      }
    ];
  }

  constructor(
    readonly postsService: PostsService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {
    this.postsService.loadPosts().pipe(takeUntilDestroyed()).subscribe({
      next: () => this.updateStats(),
      error: () => this.notificationService.toast(this.i18n.translate('dashboard.posts.loadError'), 'error')
    });
  }

  onCreatePost(): void {
    this.showPostForm$.set(true);
    this.editingPostId$.set(null);
  }

  onBulkUpload(): void {
    this.showBulkUpload$.set(true);
  }

  closeBulkUpload(): void {
    this.showBulkUpload$.set(false);
  }

  onBulkUploadComplete(): void {
    this.closeBulkUpload();
    this.reloadPosts();
  }

  closeForm(): void {
    this.showPostForm$.set(false);
    this.editingPostId$.set(null);
  }

  onFormSubmitted(): void {
    this.closeForm();
    this.reloadPosts();
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const post = event.row as unknown as Post;
    switch (event.action) {
      case 'view': this.viewPost(post); break;
      case 'edit': this.editPost(post); break;
      case 'publish': this.publishPost(post); break;
      case 'archive': this.archivePost(post); break;
      case 'delete': this.deletePost(post); break;
    }
  }

  viewPost(post: Post): void {
    this.notificationService.toast(this.i18n.translate('dashboard.posts.viewOpened'), 'success');
    this.modalService
      .openConfirm(post.title, `Autor: ${post.author}\nVistas: ${(post as any).views || 0}\nCreado: ${post.createdAt}`)
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  editPost(post: Post): void {
    this.editingPostId$.set((post._id ?? post.id) as string);
    this.showPostForm$.set(true);
  }

  publishPost(post: Post): void {
    const postId = (post._id ?? post.id) as string;
    this.postsService.changePostStatus(postId, 'published').pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.reloadPosts();
        this.notificationService.toast(this.i18n.translate('dashboard.posts.publishSuccess'), 'success');
      },
      error: () => this.notificationService.toast(this.i18n.translate('dashboard.posts.publishError'), 'error')
    });
  }

  archivePost(post: Post): void {
    const postId = (post._id ?? post.id) as string;
    this.postsService.changePostStatus(postId, 'archived').pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.reloadPosts();
        this.notificationService.toast(this.i18n.translate('dashboard.posts.archiveSuccess'), 'success');
      },
      error: () => this.notificationService.toast(this.i18n.translate('dashboard.posts.archiveError'), 'error')
    });
  }

  deletePost(post: Post): void {
    this.modalService
      .openConfirm(this.i18n.translate('dashboard.posts.deleteConfirmTitle'), this.i18n.translate('dashboard.posts.deleteConfirmBody').replace('{name}', post.title), true)
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        if (result.confirmed) {
          const postId = (post._id ?? post.id) as string;
          this.postsService.deletePost(postId).pipe(takeUntilDestroyed()).subscribe({
            next: () => {
              this.reloadPosts();
              this.notificationService.toast(this.i18n.translate('dashboard.posts.deleteSuccess'), 'success');
            },
            error: () => this.notificationService.toast(this.i18n.translate('dashboard.posts.deleteError'), 'error')
          });
        }
      });
  }

  onGlobalSearch(): void {
    this.currentPage$.set(1);
    this.updateActiveFilters();
  }

  onStatusFilterChange(): void {
    this.currentPage$.set(1);
    this.updateActiveFilters();
  }

  onColumnFilter(filters: Array<{ column: string; value: string }>): void {
    const filterMap: Record<string, string> = {};
    filters.forEach(f => { filterMap[f.column] = f.value; });
    this.columnFilters$.set(filterMap);
    this.currentPage$.set(1);
    this.updateActiveFilters();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    this.sortState$.set({ sortBy: event.sortBy, sortOrder: event.sortOrder });
  }

  onPageChange(page: number): void {
    this.currentPage$.set(page);
  }

  clearAllFilters(): void {
    this.globalSearch$.set('');
    this.statusFilter$.set('');
    this.columnFilters$.set({});
    this.currentPage$.set(1);
    this.updateActiveFilters();
  }

  private reloadPosts(): void {
    this.postsService.loadPosts().pipe(takeUntilDestroyed()).subscribe({
      next: () => this.updateStats(),
      error: () => this.notificationService.toast(this.i18n.translate('dashboard.posts.loadError'), 'error')
    });
  }

  private updateStats(): void {
    const posts = this.postsService.posts$();
    this.totalPostsCount$.set(posts.length);
    this.publishedCount$.set(posts.filter(p => p.status === 'published').length);
    this.draftCount$.set(posts.filter(p => p.status === 'draft').length);
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters$.set(
      this.globalSearch$() !== '' ||
      this.statusFilter$() !== '' ||
      Object.keys(this.columnFilters$()).length > 0
    );
  }
}
