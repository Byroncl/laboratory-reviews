import { Injectable, signal, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiService } from '../../../core/services/api.service';
import { User, UpdateUserDto, ChangePasswordDto } from '../../../shared/models/user.model';
import { selectAuthUser } from '../../auth/store/auth.selectors';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap, filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private store = inject(Store);
  private api = inject(ApiService);

  readonly currentUser = signal<User | null>(null);
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly isOwnProfile = computed(() => {
    const currentUser = this.currentUser();
    const authUser = this.getAuthUser();
    if (!currentUser || !authUser) return false;
    return (currentUser._id ?? currentUser.id) === (authUser.id);
  });

  constructor() {
    this.initializeCurrentUser();
  }

  private initializeCurrentUser(): void {
    this.store.select(selectAuthUser)
      .pipe(
        filter((user): user is any => !!user),
        switchMap(authUser => this.loadUserProfile((authUser.id)))
      )
      .subscribe();
  }

  private getAuthUser(): any {
    let authUser: any = null;
    this.store.select(selectAuthUser).subscribe(user => {
      authUser = user;
    }).unsubscribe();
    return authUser;
  }

  loadUserProfile(userId?: string): Observable<{ data: User; message: string }> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.get<{ data: User; message: string }>('/users/profile', {})
      .pipe(
        tap(response => {
          const user = response.data;
          const authUser = this.getAuthUser();

          // Validar que solo pueda acceder a su propio perfil
          if (userId && authUser && (user._id ?? user.id) !== authUser.id) {
            throw new Error('No autorizado para acceder a este perfil');
          }

          this.currentUser.set(user);
          this.loading.set(false);
        }),
        catchError(err => {
          const message = err?.error?.message || 'Error al cargar el perfil';
          this.error.set(message);
          this.loading.set(false);
          return throwError(() => err);
        })
      );
  }

  updateProfile(dto: UpdateUserDto): Observable<{ data: User; message: string }> {
    const currentUser = this.currentUser();
    if (!currentUser || !this.isOwnProfile()) {
      return throwError(() => new Error('No autorizado para actualizar este perfil'));
    }

    const userId = (currentUser._id ?? currentUser.id) as string;
    this.saving.set(true);
    this.error.set(null);

    return this.api.put<{ data: User; message: string }>(`/users/${userId}`, dto)
      .pipe(
        tap(response => {
          this.currentUser.set(response.data);
          this.saving.set(false);
        }),
        catchError(err => {
          const message = err?.error?.message || 'Error al actualizar el perfil';
          this.error.set(message);
          this.saving.set(false);
          return throwError(() => err);
        })
      );
  }

  changePassword(dto: ChangePasswordDto): Observable<{ message: string }> {
    const currentUser = this.currentUser();
    if (!currentUser || !this.isOwnProfile()) {
      return throwError(() => new Error('No autorizado para cambiar la contraseña'));
    }

    const userId = (currentUser._id ?? currentUser.id) as string;
    this.saving.set(true);
    this.error.set(null);

    return this.api.post<{ message: string }>(`/users/${userId}/change-password`, dto)
      .pipe(
        tap(() => {
          this.saving.set(false);
        }),
        catchError(err => {
          const message = err?.error?.message || 'Error al cambiar la contraseña';
          this.error.set(message);
          this.saving.set(false);
          return throwError(() => err);
        })
      );
  }
}
