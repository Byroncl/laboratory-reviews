import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { StorageService } from './storage.service';
import { AUTH_ENDPOINTS } from '../constants';
import { IAuthResponse, IAuthUser, ILoginRequest, IRegisterRequest, ITokenPayload } from '../interfaces';
import { mapAuthError } from '../utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private retryAttempts = 2;

  // Signals for reactive state
  readonly isLoading$ = signal(false);
  readonly error$ = signal<string | null>(null);
  readonly currentUser$ = signal<IAuthUser | null>(null);

  // Computed properties
  readonly isAuthenticated = computed(() => !!this.currentUser$());
  readonly token = computed(() => this.storageService.getToken());

  // Subject for token refresh broadcast
  private tokenRefreshed$ = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.initializeUser();
  }

  /**
   * Initialize user from storage
   */
  private initializeUser(): void {
    const storedUser = this.storageService.getUser();
    if (storedUser) {
      this.currentUser$.set(storedUser);
    }
  }

  /**
   * Login with credentials
   */
  login(request: ILoginRequest): Observable<IAuthResponse> {
    this.isLoading$.set(true);
    this.error$.set(null);

    return this.http.post<any>(
      `${this.apiUrl}${AUTH_ENDPOINTS.LOGIN}`,
      request
    ).pipe(
      retry(this.retryAttempts),
      map(response => response.data || response),
      tap(response => this._handleAuthSuccess(response)),
      catchError(error => this._handleAuthError(error))
    );
  }

  /**
   * Register new account
   */
  register(request: IRegisterRequest): Observable<IAuthResponse> {
    this.isLoading$.set(true);
    this.error$.set(null);

    return this.http.post<any>(
      `${this.apiUrl}${AUTH_ENDPOINTS.REGISTER}`,
      request
    ).pipe(
      retry(this.retryAttempts),
      map(response => response.data || response),
      tap(response => this._handleAuthSuccess(response)),
      catchError(error => this._handleAuthError(error))
    );
  }

  /**
   * Logout and clear session
   */
  logout(): Observable<void> {
    this.isLoading$.set(true);
    this.error$.set(null);

    return this.http.post<void>(
      `${this.apiUrl}${AUTH_ENDPOINTS.LOGOUT}`,
      {}
    ).pipe(
      tap(() => this._handleLogoutSuccess()),
      catchError(error => {
        this._handleLogoutSuccess(); // Clear local state even if API fails
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.storageService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ access_token: string }>(
      `${this.apiUrl}${AUTH_ENDPOINTS.REFRESH}`,
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => {
        this.storageService.setToken(response.access_token);
        this.tokenRefreshed$.next(response.access_token);
      }),
      map(response => response.access_token),
      catchError(error => {
        this._handleLogoutSuccess(); // Auto logout on refresh failure
        return this._handleAuthError(error);
      })
    );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<IAuthUser> {
    return this.http.get<IAuthUser>(
      `${this.apiUrl}${AUTH_ENDPOINTS.ME}`
    ).pipe(
      tap(user => this.currentUser$.set(user)),
      catchError(error => this._handleAuthError(error))
    );
  }

  /**
   * Get stored token without API call
   */
  getStoredToken(): string | null {
    return this.storageService.getToken();
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    return !this.storageService.isTokenValid();
  }

  /**
   * Handle successful authentication
   */
  private _handleAuthSuccess(response: IAuthResponse): void {
    this.storageService.setToken(response.access_token);
    if (response.refresh_token) {
      this.storageService.setRefreshToken(response.refresh_token);
    }
    if (response.expiresIn) {
      this.storageService.setExpiresAt(Date.now() + response.expiresIn * 1000);
    }
    this.storageService.setUser(response.user);
    this.currentUser$.set(response.user);
    this.isLoading$.set(false);
  }

  /**
   * Handle logout
   */
  private _handleLogoutSuccess(): void {
    this.storageService.clearAll();
    this.currentUser$.set(null);
    this.error$.set(null);
    this.isLoading$.set(false);
  }

  /**
   * Handle authentication error
   */
  private _handleAuthError(error: HttpErrorResponse): Observable<never> {
    const authError = mapAuthError(error);
    this.error$.set(authError.message);
    this.isLoading$.set(false);
    return throwError(() => authError);
  }
}
