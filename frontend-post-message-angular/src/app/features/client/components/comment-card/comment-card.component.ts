import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CommentDto } from '../../types';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './comment-card.component.html',
  styleUrl: './comment-card.component.scss',
})
export class CommentCardComponent {
  readonly comment = input.required<CommentDto>();
  readonly showDelete = input(false);
  readonly postId = input<string>('');

  readonly delete = output<string>();
  readonly viewPost = output<string>();

  onDelete(): void {
    this.delete.emit(this.comment()._id);
  }

  onViewPost(event: Event): void {
    event.preventDefault();
    this.viewPost.emit(this.comment().postId);
  }
}
