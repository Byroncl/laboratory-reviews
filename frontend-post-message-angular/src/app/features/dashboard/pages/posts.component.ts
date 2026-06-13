import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { PostsService } from '../../posts/services/posts.service';
import { Post } from '../../../shared/models/post.model';

@Component({
  selector: 'app-posts',
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
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 class="text-3xl font-bold text-primary">{{ 'sidebar.posts' | t }}</h1>
        <button
          (click)="onCreatePost()"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium text-sm whitespace-nowrap"
        >
          + Nuevo Post
        </button>
      </div>

      <!-- Global Search and Filter -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Buscar posts..."
          [(ngModel)]="globalSearch"
          (input)="onGlobalSearch()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        />
        <select
          [(ngModel)]="statusFilter"
          (change)="onStatusFilterChange()"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        >
          <option value="">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="archived">Archivado</option>
        </select>

        @if (hasActiveFilters) {
          <button
            (click)="clearAllFilters()"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
          >
            Limpiar filtros
          </button>
        }
      </div>

      <!-- Loading State -->
      @if (postsService.loading()) {
        <app-skeleton type="table"></app-skeleton>
      } @else {
        @if (filteredPosts.length > 0) {
          <!-- Table with Column Filters -->
          <app-table
            [columns]="columns"
            [data]="filteredPosts"
            [actions]="actions"
            [primaryColumnKey]="'title'"
            (actionTriggered)="onTableAction($event)"
            (sorted)="onSort($event)"
            (filtered)="onColumnFilter($event)"
          ></app-table>

          <!-- Pagination -->
          <app-pagination
            [currentPage]="currentPage"
            [totalPages]="totalPages"
            [total]="filteredPosts.length"
            [pageSize]="pageSize"
            (pageChanged)="onPageChange($event)"
          ></app-pagination>
        } @else {
          <div class="bg-white rounded-lg shadow p-8 text-center">
            <p class="text-gray-500 font-medium">No hay posts que coincidan con los filtros</p>
          </div>
        }
      }

      <!-- Post Stats (Desktop) -->
      <div class="hidden md:grid grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p class="text-secondary text-sm font-medium">Total de Posts</p>
          <p class="text-2xl font-bold text-primary mt-2">{{ totalPostsCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p class="text-secondary text-sm font-medium">Publicados</p>
          <p class="text-2xl font-bold text-green-600 mt-2">{{ publishedCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p class="text-secondary text-sm font-medium">En Borrador</p>
          <p class="text-2xl font-bold text-yellow-600 mt-2">{{ draftCount }}</p>
        </div>
      </div>
    </div>
  `
})
export class PostsComponent implements OnInit, OnDestroy {
  currentPage = 1;
  pageSize = 10;
  globalSearch = '';
  statusFilter = '';
  hasActiveFilters = false;
  totalPostsCount = 0;
  publishedCount = 0;
  draftCount = 0;
  private columnFilters: Record<string, string> = {};
  private destroy$ = new Subject<void>();

  columns: TableColumn[] = [
    { key: 'title', label: 'Título', sortable: true, filterable: true },
    { key: 'author', label: 'Autor', sortable: true, filterable: true },
    { key: 'status', label: 'Estado', template: true, filterable: true },
    { key: 'views', label: 'Vistas', sortable: true },
    { key: 'createdAt', label: 'Creado', sortable: true }
  ];

  actions: TableAction[] = [
    { id: 'view', label: 'Ver', icon: 'view', class: 'text-blue-600 hover:text-blue-700' },
    { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'delete',
      class: 'text-red-600 hover:text-red-700',
      confirm: true,
      confirmMessage: '¿Estás seguro de que deseas eliminar este post?'
    }
  ];

  get filteredPosts(): Post[] {
    return this.postsService.posts().filter(post => this.matchesAllFilters(post));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.pageSize);
  }

  constructor(
    public postsService: PostsService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.postsService.loadPosts().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.updateStats();
      },
      error: () => {
        this.notificationService.toast('Error al cargar posts', 'error');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateStats(): void {
    const posts = this.postsService.posts();
    this.totalPostsCount = posts.length;
    this.publishedCount = posts.filter(p => p.status === 'published').length;
    this.draftCount = posts.filter(p => p.status === 'draft').length;
  }

  onCreatePost(): void {
    this.modalService
      .openConfirm(
        'Nuevo Post',
        'Funcionalidad de crear posts próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          this.notificationService.success('Post creado', 'El post se creó correctamente');
        }
      });
  }

  onTableAction(event: { action: string; row: Record<string, unknown> }): void {
    const post = event.row as unknown as Post;

    switch (event.action) {
      case 'view':
        this.viewPost(post);
        break;
      case 'edit':
        this.editPost(post);
        break;
      case 'delete':
        this.deletePost(post);
        break;
    }
  }

  viewPost(post: Post): void {
    this.notificationService.toast('Post abierto', 'success');
    this.modalService
      .openConfirm(
        post.title,
        `Autor: ${post.author}\nVistas: ${post.views}\nCreado: ${post.createdAt}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  editPost(post: Post): void {
    this.modalService
      .openConfirm(
        `Editar: ${post.title}`,
        'Funcionalidad de edición próximamente disponible.'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  deletePost(post: Post): void {
    this.modalService
      .openConfirm(
        'Confirmar eliminación',
        `¿Estás seguro de que deseas eliminar "${post.title}"?`,
        true
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.confirmed) {
          const postId = (post._id ?? post.id) as string;
          this.postsService.deletePost(postId).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.updateStats();
              this.notificationService.toast('Post eliminado correctamente', 'success');
            },
            error: () => {
              this.notificationService.toast('Error al eliminar el post', 'error');
            }
          });
        }
      });
  }

  onGlobalSearch(): void {
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  onColumnFilter(filters: Array<{ column: string; value: string }>): void {
    this.columnFilters = {};
    filters.forEach(filter => {
      this.columnFilters[filter.column] = filter.value;
    });
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    const sortedPosts = [...this.postsService.posts()].sort((a, b) => {
      const aVal = a[event.sortBy as keyof Post];
      const bVal = b[event.sortBy as keyof Post];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return event.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();

      return event.sortOrder === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    this.postsService.posts.set(sortedPosts);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  clearAllFilters(): void {
    this.globalSearch = '';
    this.statusFilter = '';
    this.columnFilters = {};
    this.currentPage = 1;
    this.updateActiveFilters();
  }

  private matchesAllFilters(post: Post): boolean {
    // Global search
    if (
      this.globalSearch &&
      !post.title.toLowerCase().includes(this.globalSearch.toLowerCase()) &&
      !post.author.toLowerCase().includes(this.globalSearch.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (this.statusFilter && post.status !== this.statusFilter) {
      return false;
    }

    // Column filters
    for (const [column, filterValue] of Object.entries(this.columnFilters)) {
      const cellValue = String(post[column as keyof Post] || '')
        .toLowerCase();
      if (!cellValue.includes(filterValue.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  private updateActiveFilters(): void {
    this.hasActiveFilters =
      this.globalSearch !== '' ||
      this.statusFilter !== '' ||
      Object.keys(this.columnFilters).length > 0;
  }
}
