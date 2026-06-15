import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { ReactionsService } from '../../services';
import { IReactionSummary } from '../../interfaces';
import { REACTION_EMOJIS } from '../../constants';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './reaction-bar.component.html',
  styleUrls: ['./reaction-bar.component.css'],
})
export class ReactionBarComponent implements OnInit {
  @Input() commentId!: string;

  private reactionsService = inject(ReactionsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly showAuthModal = signal(false);

  readonly availableEmojis = REACTION_EMOJIS;

  /** Local signal for the current summary — updated optimistically */
  readonly summary = signal<IReactionSummary[]>([]);
  /** Track which emojis the current user has reacted with (optimistic) */
  readonly reactedEmojis = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.reactionsService.getReactions(this.commentId).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.reactionsService.setLocalReactions(this.commentId, data);
        const reactedEmojis = data
          .filter(r => r.reactedByMe)
          .map(r => r.emoji);
        this.reactedEmojis.set(new Set(reactedEmojis));
      },
      error: (err) => console.error('[ReactionBarComponent] getReactions error:', err),
    });
  }

  getCount(emoji: string): number {
    const list = this.summary();
    if (!Array.isArray(list)) return 0;
    return list.find((r) => r.emoji === emoji)?.count ?? 0;
  }

  hasReacted(emoji: string): boolean {
    const reacted = this.reactedEmojis();
    return reacted instanceof Set ? reacted.has(emoji) : false;
  }

  toggleReaction(emoji: string): void {
    if (!this.authService.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }
    if (this.hasReacted(emoji)) {
      this._removeReaction(emoji);
    } else {
      this._addReaction(emoji);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  closeAuthModal(): void {
    this.showAuthModal.set(false);
  }

  private _addReaction(emoji: string): void {
    // Optimistic update
    this._updateSummaryCount(emoji, 1);
    this.reactedEmojis.set(new Set([...this.reactedEmojis(), emoji]));

    this.reactionsService.addReaction(this.commentId, emoji).subscribe({
      error: (err) => {
        // Rollback on error
        this._updateSummaryCount(emoji, -1);
        const updated = new Set(this.reactedEmojis());
        updated.delete(emoji);
        this.reactedEmojis.set(updated);
        console.error('[ReactionBarComponent] addReaction error:', err);
      },
    });
  }

  private _removeReaction(emoji: string): void {
    // Optimistic update
    this._updateSummaryCount(emoji, -1);
    const updated = new Set(this.reactedEmojis());
    updated.delete(emoji);
    this.reactedEmojis.set(updated);

    this.reactionsService.removeReaction(this.commentId, emoji).subscribe({
      error: (err) => {
        // Rollback on error
        this._updateSummaryCount(emoji, 1);
        this.reactedEmojis.set(new Set([...this.reactedEmojis(), emoji]));
        console.error('[ReactionBarComponent] removeReaction error:', err);
      },
    });
  }

  private _updateSummaryCount(emoji: string, delta: number): void {
    const current = Array.isArray(this.summary()) ? this.summary() : [];
    const idx = current.findIndex((r) => r.emoji === emoji);

    if (idx >= 0) {
      const updated = [...current];
      const newCount = Math.max(0, updated[idx].count + delta);
      if (newCount === 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx] = { ...updated[idx], count: newCount };
      }
      this.summary.set(updated);
    } else if (delta > 0) {
      this.summary.set([...current, { emoji, count: delta }]);
    }
  }
}
