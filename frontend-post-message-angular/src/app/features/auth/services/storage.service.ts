import { Injectable } from '@angular/core';
import { AUTH_STORAGE_KEYS } from '../constants';

/**
 * Abstraction layer for secure storage operations
 * Can be switched to SessionStorage, IndexedDB, or encrypted storage
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  removeToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  setUser(user: any): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  getUser(): any | null {
    const user = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  }

  setExpiresAt(expiresAt: number): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
  }

  getExpiresAt(): number | null {
    const expiresAt = localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  removeExpiresAt(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
  }

  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    this.removeExpiresAt();
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    const expiresAt = this.getExpiresAt();

    if (!token || !expiresAt) return false;

    return Date.now() < expiresAt;
  }
}
