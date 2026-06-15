import { Injectable, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap, filter, finalize } from 'rxjs/operators';

import { ApiService } from '../../../core/services/api.service';
import { selectAuthUser } from '../../auth/store/auth.selectors';
import { ProfileBaseService } from './profile-base.service';
import { IUserProfile, IProfileUpdate, IProfileResponse } from '../interfaces';
import { IChangePasswordDto } from '../interfaces';
import { PROFILE_API_ENDPOINTS, PROFILE_MESSAGES } from '../constants';
import { isOwnProfile, getUserId } from '../utils';

@Injectable({ providedIn: 'root' })
export class ProfileService extends ProfileBaseService<IUserProfile> {
  private store = inject(Store);

  // Semantic public computed aliases (matching PostsService pattern)
  public readonly currentUser = computed(() => this.currentUser$());
  public readonly loading = computed(() => this.loading$());
  public readonly saving = computed(() => this.saving$());
  public readonly error = computed(() => this.error$());

  // Computed: is the loaded profile the authenticated user's own profile?
  public readonly isOwnProfile = computed(() => {
    const current = this.currentUser$();
    const auth = this._getAuthUser();
    return isOwnProfile(current, auth?.id);
  });

  constructor() {
    super(inject(ApiService));
    this._initializeCurrentUser();
  }

  private _initializeCurrentUser(): void {
    this.store
      .select(selectAuthUser)
      .pipe(
        filter((user): user is any => !!user),
        switchMap((authUser) => this.loadUserProfile(authUser.id)),
      )
      .subscribe();
  }

  private _getAuthUser(): any {
    let authUser: any = null;
    this.store
      .select(selectAuthUser)
      .subscribe((user) => {
        authUser = user;
      })
      .unsubscribe();
    return authUser;
  }

  loadUserProfile(userId?: string): Observable<IProfileResponse> {
    this._setLoading(true);
    this._setError(null);

    return this.api.get<IProfileResponse>(PROFILE_API_ENDPOINTS.LOAD, {}).pipe(
      tap((response) => {
        const user = response.data;
        const authUser = this._getAuthUser();

        if (userId && authUser && getUserId(user) !== authUser.id) {
          throw new Error(PROFILE_MESSAGES.UNAUTHORIZED);
        }

        this._setCurrentUser(user);
      }),
      catchError((err) => this._handleError(err, PROFILE_MESSAGES.ERROR_LOADING)),
      finalize(() => this._setLoading(false)),
    );
  }

  updateProfile(dto: IProfileUpdate): Observable<IProfileResponse> {
    const current = this.currentUser$();
    if (!current || !this.isOwnProfile()) {
      return throwError(() => new Error(PROFILE_MESSAGES.UNAUTHORIZED));
    }

    const userId = this._getId(current) as string;
    this._setSaving(true);
    this._setError(null);

    const url = PROFILE_API_ENDPOINTS.UPDATE.replace(':id', userId);

    return this.api.put<IProfileResponse>(url, dto).pipe(
      tap((response) => {
        this._setCurrentUser(response.data);
      }),
      catchError((err) => this._handleError(err, PROFILE_MESSAGES.ERROR_UPDATING)),
      finalize(() => this._setSaving(false)),
    );
  }

  changePassword(dto: IChangePasswordDto): Observable<{ message: string }> {
    const current = this.currentUser$();
    if (!current || !this.isOwnProfile()) {
      return throwError(() => new Error(PROFILE_MESSAGES.UNAUTHORIZED));
    }

    const userId = this._getId(current) as string;
    this._setSaving(true);
    this._setError(null);

    const url = PROFILE_API_ENDPOINTS.CHANGE_PASSWORD.replace(':id', userId);

    return this.api.post<{ message: string }>(url, dto).pipe(
      tap(() => {
        // No user data update needed on password change
      }),
      catchError((err) =>
        this._handleError(err, PROFILE_MESSAGES.ERROR_CHANGING_PASSWORD),
      ),
      finalize(() => this._setSaving(false)),
    );
  }
}
