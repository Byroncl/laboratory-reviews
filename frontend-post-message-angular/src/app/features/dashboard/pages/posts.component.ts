import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TableComponent, TableColumn, TableAction, PaginationComponent, BadgeComponent, SpinnerComponent, SkeletonComponent } from '../../../shared/components/index';

interface Post {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  createdAt: string;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TableComponent, PaginationComponent, BadgeComponent, SpinnerComponent, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-primary">{{ 'sidebar.posts' | t }}</h1>
        <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium">
          + Nuevo Post
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar posts..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
          <option value="">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="archived">Archivado</option>
        </select>
      </div>

      <!-- Table -->
      @if (isLoading) {
        <app-skeleton type="table"></app-skeleton>
      } @else {
        <app-table
          [columns]="columns"
          [data]="posts"
          [actions]="actions"
          (actionTriggered)="onAction($event)"
          (sorted)="onSort($event)"
        ></app-table>

        <!-- Pagination -->
        <app-pagination
          [currentPage]="currentPage"
          [totalPages]="totalPages"
          [total]="total"
          [pageSize]="pageSize"
          (pageChanged)="onPageChange($event)"
        ></app-pagination>
      }
    </div>
  `
})
export class PostsComponent implements OnInit {
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  total = 45;
  totalPages = Math.ceil(45 / 10);

  columns: TableColumn[] = [
    { key: 'title', label: 'Título', sortable: true },
    { key: 'author', label: 'Autor', sortable: true },
    { key: 'status', label: 'Estado', template: true },
    { key: 'views', label: 'Vistas', sortable: true },
    { key: 'createdAt', label: 'Creado', sortable: true }
  ];

  actions: TableAction[] = [
    { id: 'edit', label: 'Editar', icon: 'edit', class: 'text-blue-600 hover:text-blue-700' },
    { id: 'delete', label: 'Eliminar', icon: 'delete', class: 'text-red-600 hover:text-red-700' }
  ];

  posts: Record<string, unknown>[] = [
    { id: '1', title: 'Introducción a Angular', author: 'Juan Pérez', status: 'published', views: 1234, createdAt: '2024-01-15' },
    { id: '2', title: 'NestJS Best Practices', author: 'María García', status: 'published', views: 892, createdAt: '2024-01-12' },
    { id: '3', title: 'MongoDB Tutorial', author: 'Carlos López', status: 'draft', views: 0, createdAt: '2024-01-10' },
    { id: '4', title: 'RESTful APIs Design', author: 'Ana Martínez', status: 'published', views: 2100, createdAt: '2024-01-08' },
    { id: '5', title: 'TypeScript Advanced', author: 'Pedro Sánchez', status: 'archived', views: 450, createdAt: '2024-01-05' },
  ];

  constructor() {
    this.totalPages = Math.ceil(this.total / this.pageSize);
  }

  ngOnInit(): void {}

  onAction(event: { action: string; row: Record<string, unknown> }): void {
    console.log('Action:', event.action, 'Row:', event.row);
  }

  onSort(event: { sortBy: string; sortOrder: 'asc' | 'desc' }): void {
    console.log('Sort:', event);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('Page changed to:', page);
  }
}
