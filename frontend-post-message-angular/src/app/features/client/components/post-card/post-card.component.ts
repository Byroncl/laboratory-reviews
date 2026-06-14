import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  @Input() post: any;
  @Input() showEditDelete = false;
  @Input() showFavorite = false;
  @Input() isFavorite = false;

  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleFavorite = new EventEmitter<string>();

  onView(): void {
    this.view.emit(this.post._id);
  }

  onEdit(): void {
    this.edit.emit(this.post._id);
  }

  onDelete(): void {
    this.delete.emit(this.post._id);
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.post._id);
  }
}
