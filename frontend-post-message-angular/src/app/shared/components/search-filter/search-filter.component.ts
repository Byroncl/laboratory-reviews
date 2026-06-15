import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchFilters {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  author?: string;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-filter-container">
      <div class="search-box">
        <input
          type="text"
          placeholder="Buscar posts..."
          [(ngModel)]="filters.search"
          (input)="onFilterChange()"
          class="search-input"
        />
        <button class="search-button" (click)="onFilterChange()">🔍</button>
      </div>

      <div class="filters-grid">
        <div class="filter-group">
          <label for="sortBy">Ordenar por:</label>
          <select
            id="sortBy"
            [(ngModel)]="filters.sortBy"
            (change)="onFilterChange()"
            class="filter-select"
          >
            <option value="createdAt">Más recientes</option>
            <option value="title">Título A-Z</option>
            <option value="author">Autor</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="sortOrder">Orden:</label>
          <select
            id="sortOrder"
            [(ngModel)]="filters.sortOrder"
            (change)="onFilterChange()"
            class="filter-select"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>

        <div class="filter-group" *ngIf="showAuthorFilter">
          <label for="author">Autor:</label>
          <input
            id="author"
            type="text"
            [(ngModel)]="filters.author"
            (input)="onFilterChange()"
            placeholder="Nombre del autor"
            class="filter-input"
          />
        </div>

        <div class="filter-group" *ngIf="showCategoryFilter">
          <label for="category">Categoría:</label>
          <select
            id="category"
            [(ngModel)]="filters.category"
            (change)="onFilterChange()"
            class="filter-select"
          >
            <option value="">Todas</option>
            <option value="tech">Tecnología</option>
            <option value="life">Vida</option>
            <option value="travel">Viajes</option>
          </select>
        </div>

        <button class="btn-reset" (click)="onReset()">Limpiar filtros</button>
      </div>
    </div>
  `,
  styles: [
    `
      .search-filter-container {
        margin-bottom: 24px;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 8px;
      }

      .search-box {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .search-input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .search-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .search-button {
        padding: 10px 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .search-button:hover {
        background-color: #0056b3;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        align-items: flex-end;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
      }

      label {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #555;
      }

      .filter-select,
      .filter-input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      }

      .filter-select:focus,
      .filter-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .btn-reset {
        padding: 8px 16px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
        font-size: 14px;
      }

      .btn-reset:hover {
        background-color: #545b62;
      }

      @media (max-width: 768px) {
        .filters-grid {
          grid-template-columns: 1fr;
        }

        .search-box {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class SearchFilterComponent {
  @Input() showAuthorFilter = false;
  @Input() showCategoryFilter = false;
  @Output() filterChange = new EventEmitter<SearchFilters>();

  filters: SearchFilters = {
    search: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    author: '',
  };

  onFilterChange(): void {
    this.filterChange.emit(this.filters);
  }

  onReset(): void {
    this.filters = {
      search: '',
      category: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      author: '',
    };
    this.filterChange.emit(this.filters);
  }
}
