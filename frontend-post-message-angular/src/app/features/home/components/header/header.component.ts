import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectIsAuthenticated, selectAuthUser } from '../../../auth/store/auth.selectors';
import { logout } from '../../../auth/store/auth.actions';
import { HOME_ROUTES } from '../../constants';
import { ClickOutsideDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly store = inject(Store);
  readonly router = inject(Router);

  readonly isAuthenticated = toSignal(this.store.select(selectIsAuthenticated), { initialValue: false });
  readonly user = toSignal(this.store.select(selectAuthUser), { initialValue: null });

  readonly menuOpen = signal(false);

  navigateToLogin(): void {
    this.router.navigate([HOME_ROUTES.LOGIN], { queryParams: { returnUrl: HOME_ROUTES.ROOT } });
  }

  navigateToRegister(): void {
    this.router.navigate([HOME_ROUTES.REGISTER], { queryParams: { returnUrl: HOME_ROUTES.ROOT } });
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  onLogout(): void {
    this.store.dispatch(logout());
    this.router.navigate([HOME_ROUTES.ROOT]);
  }
}
