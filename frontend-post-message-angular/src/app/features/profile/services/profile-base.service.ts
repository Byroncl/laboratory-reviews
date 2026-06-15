import { Injectable, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

/**
 * Abstract base service for profile-related state management.
 * Follows the PostsBaseService pattern: signal-based state, protected setters,
 * and centralised error handling.
 *
 * Subclasses inject their own dependencies and call the protected setters
 * to update state — they do NOT mutate the signals directly.
 */
@Injectable({ providedIn: 'root' })
export abstract class ProfileBaseService<T extends { _id?: string; id?: string }> {
  protected api!: ApiService;
  protected retryAttempts = 2;

  // Signal-based state management (matching PostsBaseService pattern)
  public currentUser$ = signal<T | null>(null);
  protected loading$ = signal(false);
  protected saving$ = signal(false);
  protected error$ = signal<string | null>(null);

  // Computed readonly aliases
  public isLoading = computed(() => this.loading$());
  public isSaving = computed(() => this.saving$());
  public hasError = computed(() => this.error$() !== null);

  constructor(api: ApiService) {
    this.api = api;
  }

  protected _setCurrentUser(user: T | null): void {
    this.currentUser$.set(user);
  }

  protected _setLoading(loading: boolean): void {
    this.loading$.set(loading);
  }

  protected _setSaving(saving: boolean): void {
    this.saving$.set(saving);
  }

  protected _setError(error: string | null): void {
    this.error$.set(error);
  }

  /**
   * Extracts the ID from an entity, checking _id before id.
   * Matches the PostsBaseService._getId pattern.
   */
  protected _getId(entity: T | null | undefined): string | null {
    if (!entity) return null;
    return (entity._id || entity.id) as string | null;
  }

  /**
   * Centralised error handler. Sets error signal and re-throws.
   */
  protected _handleError(
    error: HttpErrorResponse | any,
    defaultMessage: string,
  ): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || defaultMessage;
    this._setError(errorMessage);
    console.error('[ProfileBaseService Error]', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
