import { Component, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PostViewModel } from '../../../../shared/models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './post-card.component.html',
})
export class PostCardComponent {
  readonly post = input.required<PostViewModel>();

  private readonly router = inject(Router);

  navigate(): void {
    this.router.navigate(['/posts', this.post().id]);
  }
}
