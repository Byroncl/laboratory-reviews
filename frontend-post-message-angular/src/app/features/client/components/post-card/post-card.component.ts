import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { PostDto } from '../../types';
import { truncateText } from '../../utils/string.utils';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  readonly post = input.required<PostDto>();
  readonly showEditDelete = input(false);
  readonly showFavorite = input(false);
  readonly isFavorite = input(false);

  readonly view = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly toggleFavorite = output<string>();

  truncateBody(body: string): string {
    return truncateText(body);
  }

  onView(): void {
    this.view.emit(this.post()._id);
  }

  onEdit(): void {
    this.edit.emit(this.post()._id);
  }

  onDelete(): void {
    this.delete.emit(this.post()._id);
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.post()._id);
  }
}
