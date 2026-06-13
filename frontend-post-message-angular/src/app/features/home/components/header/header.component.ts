import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated, selectAuthUser } from '../../../auth/store/auth.selectors';
import { logout } from '../../../auth/store/auth.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly store = inject(Store);
  readonly router = inject(Router);

  readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  readonly user$ = this.store.select(selectAuthUser);

  readonly menuOpen = signal(false);

  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/' } });
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register'], { queryParams: { returnUrl: '/' } });
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  onLogout(): void {
    this.store.dispatch(logout());
    this.router.navigate(['/']);
  }
}
