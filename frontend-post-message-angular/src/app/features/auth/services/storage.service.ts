import { Injectable } from '@angular/core';
import { AUTH_STORAGE_KEYS } from '../constants';

/**
 * Abstraction layer for secure storage operations
 * Can be switched to SessionStorage, IndexedDB, or encrypted storage
 * SSR-safe: checks if localStorage is available before use
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor() {}

  private isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }

  setToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    }
  }

  getToken(): string | null {
    if (!this.isLocalStorageAvailable()) return null;
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  removeToken(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    }
  }

  setRefreshToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  }

  getRefreshToken(): string | null {
    if (!this.isLocalStorageAvailable()) return null;
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  removeRefreshToken(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  setUser(user: any): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  getUser(): any | null {
    if (!this.isLocalStorageAvailable()) return null;
    const user = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    }
  }

  setExpiresAt(expiresAt: number): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
    }
  }

  getExpiresAt(): number | null {
    if (!this.isLocalStorageAvailable()) return null;
    const expiresAt = localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  removeExpiresAt(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    }
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
