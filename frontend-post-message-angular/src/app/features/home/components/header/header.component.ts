import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectIsAuthenticated, selectAuthUser } from '../../../auth/store/auth.selectors';
import { logout } from '../../../auth/store/auth.actions';
import { HOME_ROUTES } from '../../constants';
import { ClickOutsideDirective } from '../../../../shared/directives';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective, TranslatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly store = inject(Store);
  private readonly i18nService = inject(I18nService);
  readonly router = inject(Router);

  readonly isAuthenticated = toSignal(this.store.select(selectIsAuthenticated), { initialValue: false });
  readonly user = toSignal(this.store.select(selectAuthUser), { initialValue: null });
  readonly currentLanguage = toSignal(this.i18nService.language$, { initialValue: this.i18nService.currentLanguage });

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

  setLanguage(lang: 'es' | 'en'): void {
    this.i18nService.setLanguage(lang);
  }
}
