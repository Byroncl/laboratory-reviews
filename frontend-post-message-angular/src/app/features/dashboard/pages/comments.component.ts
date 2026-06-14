import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-primary">{{ 'sidebar.comments' | t }}</h1>
      <div class="bg-white rounded-xl shadow p-8">
        <p class="text-gray-600">Módulo de gestión de comentarios en desarrollo...</p>
      </div>
    </div>
  `
})
export class CommentsComponent {}
