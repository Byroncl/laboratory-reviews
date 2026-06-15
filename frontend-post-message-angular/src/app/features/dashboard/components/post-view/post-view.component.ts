import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../shared/models/post.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-post-view',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ post.title }}</h2>
          <p class="text-gray-500 text-sm mt-1">{{ 'dashboard.posts.by' | t }} {{ post.author }}</p>
        </div>
        <button
          (click)="onClose()"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <!-- Status Badge -->
      <div class="flex items-center gap-3">
        <app-badge
          [value]="post.status"
          [variant]="getStatusVariant(post.status)"
        ></app-badge>
        <span class="text-gray-500 text-sm">
          {{ 'dashboard.posts.createdAt' | t }}: {{ post.createdAt | date:'short' }}
        </span>
      </div>

      <!-- Metadata -->
      <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <p class="text-gray-500 text-sm font-medium">{{ 'dashboard.posts.views' | t }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ (post as any).views || 0 }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-medium">{{ 'dashboard.posts.category' | t }}</p>
          <p class="text-gray-900">{{ post.categoryName || '—' }}</p>
        </div>
      </div>

      <!-- Image -->
      @if (post.imageUrl) {
        <div class="rounded-lg overflow-hidden">
          <img
            [src]="post.imageUrl"
            [alt]="post.title"
            class="w-full h-64 object-cover"
          />
        </div>
      }

      <!-- Content -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-3">{{ 'dashboard.posts.content' | t }}</h3>
        <p class="text-gray-900 whitespace-pre-wrap leading-relaxed">{{ post.content || post.body }}</p>
      </div>

      <!-- Footer Actions -->
      <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <button
          (click)="onClose()"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          {{ 'dashboard.common.close' | t }}
        </button>
        <button
          (click)="onEdit()"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-black transition font-medium"
        >
          {{ 'dashboard.posts.edit' | t }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PostViewComponent {
  @Input() post!: Post;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'error';
      default: return 'info';
    }
  }
}
