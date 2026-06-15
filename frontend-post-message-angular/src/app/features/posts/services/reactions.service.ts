import { environment } from '../../../../environments/environment';
import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, Subscription } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import {
  IReactionSummary,
  IReactionResponse,
} from '../interfaces';
import { COMMENTS_API_ENDPOINTS } from '../constants';
import { WebSocketService } from '../../../core/services/websocket.service';

interface ReactionAddedEvent {
  commentId: string;
  emoji: string;
  count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReactionsService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly webSocketService = inject(WebSocketService);
  private readonly baseUrl = environment.apiUrl;

  /** Map<commentId, IReactionSummary[]> */
  private readonly reactions$ = signal<Map<string, IReactionSummary[]>>(new Map());

  private readonly wsSubscription: Subscription;

  constructor() {
    this.wsSubscription = this.webSocketService.reactionAdded.subscribe((event) => {
      if (!event) return;
      this._handleReactionAddedEvent(event as ReactionAddedEvent);
    });
  }

  ngOnDestroy(): void {
    this.wsSubscription.unsubscribe();
  }

  /** Reactive summary for a given comment */
  public reactionSummary(commentId: string) {
    return computed(() => this.reactions$().get(commentId) ?? []);
  }

  /**
   * Add an emoji reaction to a comment.
   * POST /comments/:id/reactions  { emoji }
   * Updates the local signal optimistically via tap.
   */
  public addReaction(commentId: string, emoji: string): Observable<IReactionResponse> {
    const url = `${this.baseUrl}${COMMENTS_API_ENDPOINTS.REACTIONS.replace(':id', commentId)}`;

    return this.http
      .post<IReactionResponse>(url, { emoji })
      .pipe(
        tap(() => this._incrementReaction(commentId, emoji)),
        catchError((err) => this._handleError(err, 'Failed to add reaction')),
      );
  }

  /**
   * Remove an emoji reaction from a comment.
   * DELETE /comments/:id/reactions/:emoji
   * Updates the local signal via tap.
   */
  public removeReaction(commentId: string, emoji: string): Observable<void> {
    const url = `${this.baseUrl}${COMMENTS_API_ENDPOINTS.REACTION_BY_EMOJI
      .replace(':id', commentId)
      .replace(':emoji', encodeURIComponent(emoji))}`;

    return this.http
      .delete<void>(url)
      .pipe(
        tap(() => this._decrementReaction(commentId, emoji)),
        catchError((err) => this._handleError(err, 'Failed to remove reaction')),
      );
  }

  /**
   * Fetch the reaction summary for a comment and update the local signal.
   * GET /comments/:id/reactions
   */
  public getReactions(commentId: string): Observable<IReactionSummary[]> {
    const url = `${this.baseUrl}${COMMENTS_API_ENDPOINTS.REACTIONS.replace(':id', commentId)}`;

    return this.http
      .get<IReactionSummary[]>(url)
      .pipe(
        tap((summaries) => this.setLocalReactions(commentId, summaries)),
        catchError((err) => this._handleError(err, 'Failed to get reactions')),
      );
  }

  /**
   * Update the local reactions signal for a comment directly
   * (used by components for optimistic updates).
   */
  public setLocalReactions(commentId: string, summary: IReactionSummary[]): void {
    const updated = new Map(this.reactions$());
    updated.set(commentId, summary);
    this.reactions$.set(updated);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private _handleReactionAddedEvent(event: ReactionAddedEvent): void {
    const { commentId, emoji } = event;
    if (!commentId || !emoji) return;
    this._incrementReaction(commentId, emoji);
  }

  private _incrementReaction(commentId: string, emoji: string): void {
    const current = new Map(this.reactions$());
    const existing = current.get(commentId) ?? [];
    const idx = existing.findIndex((r) => r.emoji === emoji);

    if (idx >= 0) {
      const updated = [...existing];
      updated[idx] = { ...updated[idx], count: updated[idx].count + 1 };
      current.set(commentId, updated);
    } else {
      current.set(commentId, [...existing, { emoji, count: 1 }]);
    }

    this.reactions$.set(current);
  }

  private _decrementReaction(commentId: string, emoji: string): void {
    const current = new Map(this.reactions$());
    const existing = current.get(commentId) ?? [];
    const idx = existing.findIndex((r) => r.emoji === emoji);

    if (idx < 0) return;

    const updated = [...existing];
    const newCount = updated[idx].count - 1;

    if (newCount <= 0) {
      updated.splice(idx, 1);
    } else {
      updated[idx] = { ...updated[idx], count: newCount };
    }

    current.set(commentId, updated);
    this.reactions$.set(current);
  }

  private _handleError(error: any, defaultMessage: string): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || defaultMessage;
    console.error('[ReactionsService Error]', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
